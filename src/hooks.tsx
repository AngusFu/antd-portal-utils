import type { Key } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useUnmount } from 'ahooks';
import { ConfigProvider } from 'antd';

import {
  CtxResetInternalUseOnly,
  usePortalCtxKeyInternalUseOnly,
  usePortalCtxMethodsInternalUseOnly,
} from './internals';

export const HOOK_POPUP_CONTAINER_CLASS = '__container_for_getPopupContainer__';

export function useAntdPortalProps(option: {
  props: any;
  visiblePropName: string;
  hackGetPopupContainer?: boolean;
}) {
  const { props, hackGetPopupContainer, visiblePropName } = option;
  const { children, [visiblePropName]: propVisible, ...restProps } = props;

  const ctxKey = usePortalCtxKeyInternalUseOnly();
  const [visible, setVisible, afterVisibilityChange] = useCustomVisibilityControl(
    ctxKey,
    propVisible,
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const childrenWrapped = (
    <CtxResetInternalUseOnly>
      <ConfigProvider getPopupContainer={() => containerRef.current || document.body}>
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

  return {
    ctxKey,

    props: {
      ...restProps,
      children: childrenWrapped,
      [visiblePropName]: visible,
    },

    afterVisibilityChange,
    changeVisibility: (v: boolean) => setVisible(v),
  };
}

function useCustomVisibilityControl(ctxKey: Key, propVisible: boolean) {
  const ctxMethods = usePortalCtxMethodsInternalUseOnly();

  const [visible, setVisible] = useState(ctxKey ? false : propVisible);

  const afterVisibilityChange = useCallback(
    (visible: boolean) => {
      if (ctxKey && !visible) {
        ctxMethods?.closePortal({ key: ctxKey, force: true });
      }
    },
    [ctxKey, ctxMethods],
  );

  // register custom close method
  useEffect(() => {
    if (ctxKey && ctxMethods) {
      ctxMethods.setCustomCloseMethod({
        key: ctxKey,
        fn: () => setVisible(false),
      });
    }
  }, [ctxKey, ctxMethods]);

  // sync visibility
  useEffect(() => setVisible(Boolean(propVisible)), [propVisible, setVisible]);

  // avoid memory leak
  useUnmount(() => ctxMethods?.closePortal({ key: ctxKey }));

  return [visible, setVisible, afterVisibilityChange] as const;
}
