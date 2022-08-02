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

type CallbackResult<T extends 'afterVisibleChange' | 'afterClose'> = T extends 'afterClose'
  ? (...args: any[]) => void
  : T extends 'afterVisibleChange'
  ? (visible: boolean) => void
  : null;

export function useAntdPortalProps<
  P extends PropsWithChildren<{ visible?: boolean }>,
  V extends 'afterVisibleChange' | 'afterClose' = 'afterVisibleChange',
>(option: {
  props: P;
  hackGetPopupContainer?: boolean;
  afterVisibleChangeType?: V;
}): {
  ctxKey: Key;
  props: P & {
    visible: boolean;
    children: JSX.Element;
  } & CallbackResult<V>;
} {
  const { props, hackGetPopupContainer, afterVisibleChangeType } = option;
  const { visible: propVisible, children } = props;

  const ctxKey = usePortalCtxKeyInternalUseOnly();

  const [visible, setVisible, afterVisibilityChange] = useCustomVisibilityControl(
    ctxKey ? false : Boolean(propVisible),
  );

  useEffect(
    function () {
      setVisible(Boolean(propVisible));
    },
    [propVisible, setVisible],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const childrenWrapped = (
    <CtxResetInternalUseOnly>
      <ConfigProvider getPopupContainer={(node) => containerRef.current || document.body}>
        {hackGetPopupContainer ? (
          <div
            ref={containerRef}
            style={{ position: 'relative' }}
            className={HOOK_POPUP_CONTAINER_CLASS}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </ConfigProvider>
    </CtxResetInternalUseOnly>
  );

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

  const cbType = (afterVisibleChangeType ?? 'afterVisibleChange') as V;
  const cbData = { [cbType]: callbacks[cbType] } as unknown as CallbackResult<V>;
  return {
    ctxKey,
    props: {
      ...props,
      ...cbData,
      visible,
      children: childrenWrapped,
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
