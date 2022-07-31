import type { Key, PropsWithChildren, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useMemoizedFn, useUnmount } from 'ahooks';
import ConfigProvider from 'antd/es/config-provider';

import {
  CtxResetInternalUseOnly,
  usePortalCtxKeyInternalUseOnly,
  usePortalCtxMethodsInternalUseOnly,
} from './internals';

export const HOOK_POPUP_CONTAINER_CLASS = '__container_for_getPopupContainer__';

export function useAntdPortalProps<P extends PropsWithChildren<{ visible?: boolean }>>(option: {
  props: P;
  hackGetPopupContainer?: boolean;
  afterVisibleChangeType?: 'afterVisibleChange' | 'afterClose';
}): { props: P; ctxKey: Key } {
  const { props, hackGetPopupContainer, afterVisibleChangeType } = option;
  const { visible: propVisible, children } = props;

  const ctxKey = usePortalCtxKeyInternalUseOnly();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible, afterVisibilityChange] = useCustomVisibilityControl(
    ctxKey ? false : Boolean(propVisible),
  );

  useEffect(
    function () {
      setVisible(Boolean(propVisible));
    },
    [propVisible, setVisible],
  );

  let newChild: ReactNode;
  if (hackGetPopupContainer) {
    newChild = (
      <CtxResetInternalUseOnly>
        <ConfigProvider getPopupContainer={(node) => containerRef.current || document.body}>
          <div
            ref={containerRef}
            style={{ position: 'relative' }}
            className={HOOK_POPUP_CONTAINER_CLASS}
          >
            {children}
          </div>
        </ConfigProvider>
      </CtxResetInternalUseOnly>
    );
  } else {
    newChild = <CtxResetInternalUseOnly>{children}</CtxResetInternalUseOnly>;
  }

  const callbacks = {
    afterClose(...args: any[]) {
      try {
        (props as unknown as any).afterClose?.(...args);
      } finally {
        afterVisibilityChange(false);
      }
    },
    // drawer & pop-confirm
    afterVisibleChange(v: boolean) {
      try {
        (props as unknown as any).afterVisibleChange?.(v);
      } finally {
        afterVisibilityChange(v);
      }
    },
  };

  const cbType = afterVisibleChangeType ?? 'afterVisibleChange';

  return {
    ctxKey,
    props: {
      ...props,
      visible,
      children: newChild,
      [cbType]: callbacks[cbType],
    },
  };
}

function useCustomVisibilityControl(defaultVisible: boolean) {
  const [visible, setVisible] = useState(defaultVisible);

  const ctxKey = usePortalCtxKeyInternalUseOnly();
  const ctxMethods = usePortalCtxMethodsInternalUseOnly();
  const { afterVisibilityChange } = useRegisterCustomCloseMethod(() => setVisible(false));

  // avoid memory leak
  useUnmount(() => ctxMethods?.closePortal({ key: ctxKey }));

  return [visible, setVisible, afterVisibilityChange] as const;
}

function useRegisterCustomCloseMethod(fn: () => void) {
  const closeFn = useMemoizedFn(fn);
  const ctxKey = usePortalCtxKeyInternalUseOnly();
  const ctxMethods = usePortalCtxMethodsInternalUseOnly();

  useEffect(
    function () {
      if (ctxKey && ctxMethods) {
        ctxMethods.setCustomCloseMethod({
          key: ctxKey,
          fn: closeFn,
        });
      }
    },
    [ctxKey, ctxMethods, closeFn],
  );

  const afterVisibilityChange = useCallback(
    (visible: boolean) => {
      if (ctxKey && !visible) {
        ctxMethods?.closePortal({ key: ctxKey, force: true });
      }
    },
    [ctxKey, ctxMethods],
  );

  return {
    ctxKey,
    afterVisibilityChange,
  };
}
