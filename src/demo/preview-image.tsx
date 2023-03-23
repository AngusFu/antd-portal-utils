import React from 'react';

import { ImagePreview, usePortal } from 'antd-portal-utils';

import { Button } from 'antd';

export default function Demo() {
  const [utils, contextHolder] = usePortal();

  const handlePreview = function () {
    utils.openPortal(
      <ImagePreview
        data={[
          {
            src: 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
          },
          {
            src: 'https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp',
          },
          {
            src: 'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp',
          },
        ]}
        current={1}
        afterVisibleChange={(v) => {
          console.log(v);
        }}
      />,
    );
  };

  return (
    <div>
      <Button onClick={handlePreview}>preview images</Button>

      {contextHolder}
    </div>
  );
}
