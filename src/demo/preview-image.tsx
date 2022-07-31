import React, { useState } from 'react';

import type { ImageProps } from 'antd';
import Button from 'antd/es/button';
import Image from 'antd/es/image';
import 'antd/dist/antd.css';

import { createPortalUtil, useAntdPortalProps } from 'antd-portal-utils';

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
    const { close } = utils.openPortal(
      <span style={{ display: 'none' }}>
        <ImagePreview
          data={Array.isArray(props) ? [...props] : [props]}
          current={defaultIndex || 0}
          afterClose={() => {
            close();
            resolve();
          }}
        />
      </span>,
    );
  });
}

function ImagePreview({
  data,
  current,
  afterClose,
}: {
  data: ImageProps[];
  current?: number;
  afterClose?: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const { props: preview } = useAntdPortalProps({
    props: {
      current,
      visible,
      afterClose,
      onVisibleChange: setVisible,
    },
    hackGetPopupContainer: false,
    afterVisibleChangeType: 'afterClose',
  });

  if (data.length === 1) {
    return <Image {...data[0]} preview={preview} />;
  }

  return (
    <Image.PreviewGroup preview={preview}>
      {data.map((props, i) => (
        <Image {...props} key={i} />
      ))}
    </Image.PreviewGroup>
  );
}
