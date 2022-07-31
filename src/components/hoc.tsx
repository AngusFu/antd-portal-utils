import React, { ComponentType } from 'react';
import ConfigProvider from 'antd/es/config-provider';

import { useAntdPortalProps } from '../hooks';

export function withAntdPortalUtilsAdaptor<T extends ComponentType<any>>(
  Comp: T,
  config?: {
    shouldHackGetPopupContainer?: boolean;
    afterVisibleChangeType?: 'afterVisibleChange' | 'afterClose';
  },
) {
  const Modified = function (props: unknown) {
    const hackPopup = config?.shouldHackGetPopupContainer ?? true;

    const { ctxKey, props: portalProps } = useAntdPortalProps({
      props: props as any,
      hackGetPopupContainer: hackPopup,
      afterVisibleChangeType: config?.afterVisibleChangeType,
    });

    if (ctxKey) {
      return <Comp {...portalProps} key={ctxKey} />;
    }

    if (hackPopup) {
      return (
        <ConfigProvider getPopupContainer={() => document.body}>
          <Comp {...portalProps} />
        </ConfigProvider>
      );
    }

    return <Comp {...portalProps} />;
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
