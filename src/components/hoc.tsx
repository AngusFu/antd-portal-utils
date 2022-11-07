import React from 'react';
import AntdDrawer from 'antd/es/drawer';
import AntdModal from 'antd/es/modal';

import { useAntdPortalProps } from '../hooks';
import { cloneProperties, OPEN_OVER_VISIBLE } from './utils';

type DrawerType = typeof AntdDrawer;
type ModalType = typeof AntdModal;
type Config = { hackGetPopupContainer?: boolean };

export function withAntdPortalUtilsAdaptor(Comp: DrawerType, config?: Config): DrawerType;
export function withAntdPortalUtilsAdaptor(Comp: ModalType, config?: Config): ModalType;
export function withAntdPortalUtilsAdaptor(Comp: any, config?: Config) {
  const Modified = function (props: any) {
    let newProps = { ...props };
    let closeType =
      Comp === AntdModal
        ? 'afterClose'
        : OPEN_OVER_VISIBLE
        ? 'afterOpenChange'
        : 'afterVisibleChange';

    let { visible, open, ...rest } = props;
    const isUsingLegacyVisible = 'visible' in props && !('open' in props);

    if (OPEN_OVER_VISIBLE && isUsingLegacyVisible) {
      // 支持 open 但是使用了 visible 的情况
      // 干掉 warning
      newProps = {
        ...rest,
        open: visible,
      };
    } else if (!OPEN_OVER_VISIBLE) {
      // 前后兼容…… 有 open 则用 open
      newProps = {
        ...rest,
        visible: 'open' in props ? props.open : visible,
      };
    }

    const {
      ctxKey,
      props: portalProps,
      afterVisibilityChange,
    } = useAntdPortalProps({
      props: newProps,
      visiblePropName: OPEN_OVER_VISIBLE ? 'open' : 'visible',
      hackGetPopupContainer: config?.hackGetPopupContainer ?? true,
    });

    const propsGetContainer = props.getContainer;
    const getContainer = ctxKey ? propsGetContainer || (() => document.body) : propsGetContainer;

    const closeCallback =
      closeType === 'afterClose'
        ? function (...args: any[]) {
            portalProps[closeType]?.(...args);
            afterVisibilityChange(false);
          }
        : function (visible: boolean, ...args: any[]) {
            const fn = portalProps['afterOpenChange'] || portalProps['afterVisibleChange'];

            fn?.(visible, ...args);
            afterVisibilityChange(visible);
          };

    const { afterOpenChange: _, afterVisibleChange: __, ...propsToPass } = portalProps;

    return (
      <Comp
        {...{
          ...propsToPass,
          [closeType]: closeCallback,
        }}
        key={ctxKey || undefined}
        getContainer={getContainer}
      />
    );
  };

  cloneProperties(Comp, Modified);

  Modified.displayName = `withAntdPortalUtilsAdaptor(${Comp.displayName || Comp.name})`;

  return Modified as any;
}
