import React, { useState } from 'react';

import type { ImageProps } from 'antd';
import Button from 'antd/es/button';
import Image from 'antd/es/image';
import 'antd/dist/antd.css';

import { createPortalUtil } from 'antd-portal-utils';

const { contextHolder, methods: utils } = createPortalUtil(() => Date.now());

export default function App() {
  return (
    <div>
      <h1>Hello world</h1>
      <Page />

      {contextHolder}
    </div>
  );
}

export function Page() {
  return (
    <div>
      <Button
        onClick={() =>
          previewImage([
            {
              src: 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
            },
            {
              src: 'https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp',
            },
            {
              src: 'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp',
            },
          ])
        }
      >
        preview images
      </Button>

      {contextHolder}
    </div>
  );
}

function previewImage(props: ImageProps): Promise<void>;
function previewImage(props: ImageProps[], defaultIndex?: number): Promise<void>;
function previewImage(props: any, defaultIndex?: any) {
  return new Promise<void>((resolve) => {
    const handle = utils.openPortal(
      <ImagePreview
        data={Array.isArray(props) ? [...props] : [props]}
        current={defaultIndex || 0}
        onClose={() => {
          handle.close();
          resolve();
        }}
      />,
    );
  });
}

function ImagePreview({
  data,
  current,
  onClose,
}: {
  data: ImageProps[];
  current?: number;
  onClose?: () => void;
}) {
  const [visible, setVisible] = useState(true);

  const preview = {
    visible,
    current,
    onVisibleChange: (value: boolean) => {
      setVisible(value);

      if (!value) {
        onClose?.();
      }
    },
  };

  if (data.length === 1) {
    return <Image {...data[0]} style={{ display: 'none' }} preview={preview} />;
  }

  return (
    <Image.PreviewGroup preview={preview}>
      {data.map((props, i) => (
        <Image {...props} style={{ display: 'none' }} key={i} />
      ))}
    </Image.PreviewGroup>
  );
}
