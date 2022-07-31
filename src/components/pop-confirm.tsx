import { CSSProperties, forwardRef, MutableRefObject, RefObject, useContext } from 'react';
import React, { useRef, useState } from 'react';

import { useClickAway, useEventListener, useUnmount } from 'ahooks';
import ConfigProvider from 'antd/es/config-provider';
import type { PopconfirmProps } from 'antd/es/popconfirm';
import AntdPopconfirm from 'antd/es/popconfirm';
import { usePopper } from 'react-popper';

import { HOOK_POPUP_CONTAINER_CLASS, useAntdPortalProps } from '../hooks';
import classNames from 'classnames';
import { usePortalCtxKeyInternalUseOnly, usePortalCtxMethodsInternalUseOnly } from '../internals';

export default /* #__PURE__*/ forwardRef(function Popconfirm(
  props: PopconfirmProps,
  ref: React.Ref<unknown>,
) {
  const ctxKey = usePortalCtxKeyInternalUseOnly();

  if (ctxKey) {
    return <PopConfirmPortal {...props} refElemRef={ref as MutableRefObject<any>} />;
  }

  return <AntdPopconfirm {...props} ref={ref} />;
});

function PopConfirmPortal({
  refElemRef,
  ...props
}: PopconfirmProps & {
  refElemRef: MutableRefObject<unknown>;
}) {
  const reference = refElemRef.current as HTMLElement;

  // handle resize
  const ref = useRef<any>();
  usePopupForceAlign(ref);

  const ctxMethods = usePortalCtxMethodsInternalUseOnly();
  const { ctxKey, props: popConfirmProps } = useAntdPortalProps({
    props: {
      visible: true,
      ...props,
    },
    hackGetPopupContainer: false,
    afterVisibleChangeType: 'afterVisibleChange',
  });

  const triggerDOM = useFakeTrigger({
    ...popConfirmProps,
    reference,
  });
  const getPopupContainer = usePopupContainerMethod({ reference });

  const overlayUniqClass = `overlay-${ctxKey}`;
  const triggerUniqClass = `trigger-${ctxKey}`;
  useClickAway(
    () => ctxMethods?.closePortal({ key: ctxKey }),
    [
      () => document.querySelector(`.${triggerUniqClass}`),
      () => document.querySelector(`.${overlayUniqClass}`),
      () => reference,
    ],
    'click',
  );

  const extraProps = {
    getPopupContainer,
    openClassName: classNames(triggerUniqClass, popConfirmProps.openClassName),
    overlayClassName: classNames(overlayUniqClass, popConfirmProps.overlayClassName),
  };

  return (
    <AntdPopconfirm
      {...extraProps}
      {...popConfirmProps}
      visible={reference ? popConfirmProps.visible : false}
    >
      {triggerDOM}
    </AntdPopconfirm>
  );
}

function useFakeTrigger({ visible, reference }: { visible?: boolean; reference?: HTMLElement }) {
  const [popperElem, setPopperElem] = useState<HTMLElement | null>(null);
  const popper = usePopper(reference, popperElem, { placement: 'top-start' });

  const popperState = popper.state;
  const popperStyle = popper.styles.popper;

  const isBottom = popperState?.placement.includes('bottom');
  const isTop = popperState?.placement.includes('top');
  // eslint-disable-next-line no-nested-ternary
  const translateY = `translateY(${isBottom ? -100 : isTop ? 100 : 0}%)`;
  const style: CSSProperties = {
    ...popperStyle,
    pointerEvents: visible ? 'all' : 'none',
    // background: 'rgba(0, 255, 0, 0.5)',
    zIndex: Number.MAX_SAFE_INTEGER,
    width: popperState?.rects?.reference.width,
    height: popperState?.rects?.reference.height,
    transform: `${popperStyle.transform || ''} ${translateY}`.trim(),
  };

  return <div ref={setPopperElem} style={style} {...popper.attributes.popper} />;
}

function usePopupForceAlign(ref: RefObject<any>) {
  const timerRef = useRef(-1);
  useEventListener(
    'resize',
    () => {
      window.clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        const popupRef = ref.current?.popupRef;

        if (popupRef && popupRef.current) {
          popupRef.current.forceAlign?.();
        }
        // avoid flashing
      }, 250);
    },
    {
      target: window,
    },
  );
  useUnmount(() => window.clearTimeout(timerRef.current));
}

function usePopupContainerMethod({ reference }: { reference?: HTMLElement }) {
  const config = useContext(ConfigProvider.ConfigContext);

  return function getPopupContainer(node: any) {
    const closestDrawer = reference?.closest(`.${HOOK_POPUP_CONTAINER_CLASS}`);

    if (closestDrawer) {
      return closestDrawer as HTMLDivElement;
    }

    return config.getPopupContainer?.(node) || document.body;
  };
}
