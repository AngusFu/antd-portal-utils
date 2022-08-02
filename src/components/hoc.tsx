import React from 'react';
import AntdDrawer from 'antd/es/drawer';
import AntdModal from 'antd/es/modal';

import { useAntdPortalProps } from '../hooks';

type CompTypes = typeof AntdDrawer | typeof AntdModal;

export function withAntdPortalUtilsAdaptor<T extends CompTypes>(
  Comp: T,
  config?: {
    hackGetPopupContainer?: boolean;
    afterVisibleChangeType?: 'afterVisibleChange' | 'afterClose';
  },
) {
  const Modified = function (props: unknown) {
    const hackPopup = config?.hackGetPopupContainer ?? true;
    const { ctxKey, props: portalProps } = useAntdPortalProps({
      props: props as any,
      afterVisibleChangeType: config?.afterVisibleChangeType,
      hackGetPopupContainer: (props as any).__hack_popup_container__ ?? hackPopup,
    });
    const propsGetContainer = (props as any).getContainer;

    return (
      <Comp
        {...portalProps}
        key={ctxKey || undefined}
        getContainer={ctxKey ? propsGetContainer || (() => document.body) : propsGetContainer}
      />
    );
  };

  cloneProperties(Comp, Modified);
  Modified.displayName = `withAntdPortalUtilsAdaptor(${Comp.displayName || Comp.name})`;

  return Modified as T;
}

function cloneProperties<T extends Function>(from: T, to: any) {
  Object.keys(from)
    .filter((key) => !['name', 'length', 'prototype', 'displayName'].includes(key))
    .forEach((key) =>
      Object.defineProperty(to, key, {
        get() {
          return from[key as keyof typeof from];
        },
      }),
    );
  to.prototype = from.prototype;
}
