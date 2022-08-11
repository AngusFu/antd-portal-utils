import React, { useRef } from 'react';

import { useCreation, useEventListener } from 'ahooks';
import { useAntdPortalProps } from 'antd-portal-utils';

import type { ImageProps } from 'antd';
import Image from 'antd/es/image';

export type ImagePreviewProps = {
  data: ImageProps | ImageProps[];
  current?: number;
  afterVisibleChange?: (visible: boolean) => void;
};

export default function ImagePreview(props: ImagePreviewProps) {
  const { current, afterVisibleChange } = props;
  const data = Array.isArray(props.data) ? props.data : [props.data];
  const wrapClassName = useCreation(() => `preview-root-${Date.now()}`, []);
  const visibleRef = useRef(true);

  const {
    changeVisibility,
    props: { afterVisibleChange: afterVisibilityChanged, ...preview },
  } = useAntdPortalProps({
    props: {
      current,
      visible: true,
      wrapClassName,
      afterVisibleChange,
    },
    hackGetPopupContainer: false,
    afterVisibleChangeType: 'afterVisibleChange',
  });

  useEventListener(
    'animationend',
    (e: AnimationEvent) => {
      if (e.currentTarget === e.target) {
        afterVisibilityChanged(visibleRef.current);
      }
    },
    {
      target: () => document.querySelector(`.${wrapClassName} [role="dialog"]`),
    },
  );
  const previewProps = {
    ...preview,
    onVisibleChange(visible: boolean) {
      visibleRef.current = visible;
      changeVisibility(visible);
    },
  };

  if (data.length === 1) {
    return (
      <span style={{ display: 'none' }}>
        <Image {...data[0]} preview={previewProps} loading="lazy" />
      </span>
    );
  }

  return (
    <span style={{ display: 'none' }}>
      <Image.PreviewGroup preview={previewProps}>
        {data.map((props, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Image {...props} key={i} loading="lazy" />
        ))}
      </Image.PreviewGroup>
    </span>
  );
}
