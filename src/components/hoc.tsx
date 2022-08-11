import React from 'react';
import AntdDrawer from 'antd/es/drawer';
import AntdModal from 'antd/es/modal';

import { useAntdPortalProps } from '../hooks';

type DrawerType = typeof AntdDrawer;
type ModalType = typeof AntdModal;
type Config = { hackGetPopupContainer?: boolean };

export function withAntdPortalUtilsAdaptor(Comp: DrawerType, config?: Config): DrawerType;
export function withAntdPortalUtilsAdaptor(Comp: ModalType, config?: Config): ModalType;
export function withAntdPortalUtilsAdaptor(Comp: any, config?: Config) {
  const afterVisibleChangeType = Comp === AntdModal ? 'afterClose' : 'afterVisibleChange';
  const hackPopup = config?.hackGetPopupContainer ?? true;

  const Modified = function (props: any) {
    const { ctxKey, props: portalProps } = useAntdPortalProps({
      props,
      afterVisibleChangeType,
      hackGetPopupContainer: hackPopup,
    });
    const propsGetContainer = props.getContainer;

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

  return Modified as any;
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
