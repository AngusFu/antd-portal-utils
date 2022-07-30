import React, { createContext } from 'react';

import { usePortal, Drawer, Modal } from 'antd-portal-utils';

import { Button, Space } from 'antd';

import 'antd/es/button/style';
import 'antd/es/drawer/style';
import 'antd/es/modal/style';
import 'antd/es/popconfirm/style';
import 'antd/es/space/style';

const ReachableContext = createContext<string | null>(null);
const UnreachableContext = createContext<string | null>(null);

const content = (
  <>
    <ReachableContext.Consumer>{(name) => `Reachable: ${name}!`}</ReachableContext.Consumer>
    <br />
    <UnreachableContext.Consumer>{(name) => `Unreachable: ${name}!`}</UnreachableContext.Consumer>
  </>
);

export default function Demo() {
  const [util, contextHolder] = usePortal();

  const handleOpenDrawer = function () {
    const { close } = util.openPortal(
      <Drawer visible={true} title="Hello World" onClose={() => close()}>
        {content}
        <br />
        <Button
          style={{ margin: '400px 0 500px' }}
          onClick={(e) => handleOpenPopConfirm(e.target as HTMLButtonElement)}
        >
          Open PopConfirm
        </Button>
      </Drawer>,
    );
  };

  const handleOpenModal = function () {
    const { close } = util.openPortal(
      <Modal visible={true} onCancel={() => close()}>
        {content}
      </Modal>,
    );
  };

  const handleOpenPopConfirm = function (el: HTMLElement) {
    const { close } = util.openPopConfirm({
      title: 'Hello World',
      reference: el,
      onCancel: () => close(),
      onConfirm: () =>
        new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
          close();
        }),
    });
  };

  return (
    <ReachableContext.Provider value="Light">
      <Space size={32}>
        <Button onClick={handleOpenDrawer}>Open Drawer</Button>

        <Button onClick={handleOpenModal}>Open Modal</Button>

        <Button onClick={(e) => handleOpenPopConfirm(e.target as HTMLButtonElement)}>
          Open PopConfirm
        </Button>
      </Space>

      {/* `contextHolder` should always be placed under the context you want to access */}
      {contextHolder}

      {/* Can not access this context since `contextHolder` is not in it */}
      <UnreachableContext.Provider value="Bamboo" />
    </ReachableContext.Provider>
  );
}
