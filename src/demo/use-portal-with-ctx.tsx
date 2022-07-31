import React, { createContext } from 'react';

import { usePortal, Drawer, Modal } from 'antd-portal-utils';

import { Button, Space } from 'antd';
import 'antd/dist/antd.css';

const ReachableContext = createContext<string | null>(null);
const UnreachableContext = createContext<string | null>(null);

const content = (
  <>
    <ReachableContext.Consumer>{(name) => `Reachable: ${name}!`}</ReachableContext.Consumer>
    <br />
    <UnreachableContext.Consumer>{(name) => `Unreachable: ${name}!`}</UnreachableContext.Consumer>
  </>
);

function wait(t: number) {
  return new Promise((resolve) => setTimeout(resolve, 500));
}
async function request(index: number) {
  await wait(500);

  if (index % 2 === 0) {
    throw new Error('Please Retry');
  }

  return { data: 'Ok' };
}

export default function Demo() {
  const [util, contextHolder] = usePortal();

  const handleOpenDrawer = function () {
    const { close } = util.openPortal(
      <Drawer visible={true} title="Hello World" onClose={() => close()}>
        {content}
        <br />
        <Button
          style={{ margin: '400px 0 500px' }}
          onClick={(e) => handleOpenPopConfirm(e.currentTarget as HTMLButtonElement)}
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

  const handleOpenPopConfirm = async function (el: HTMLElement) {
    const { close, update } = util.openPopConfirm({
      title: 'Confirm to delete?',
      reference: el,
      overlayStyle: { width: 300 },
      placement: 'topRight',
      onCancel: () => close(),
    });

    const scheduleNext = (action: () => Promise<any>) =>
      new Promise<any>((resolve, reject) => {
        update({
          onConfirm: async () => {
            try {
              resolve(await action());
              close();
            } catch (e: any) {
              reject(e);
            }
          },
        });
      });

    try {
      await scheduleNext(() => request(0));
    } catch (e: any) {
      update({ title: e.message });
      await scheduleNext(() => request(1));
    }
  };

  return (
    <ReachableContext.Provider value="Light">
      <Space size={32}>
        <Button onClick={handleOpenDrawer}>Open Drawer</Button>

        <Button onClick={handleOpenModal}>Open Modal</Button>

        <Button onClick={(e) => handleOpenPopConfirm(e.currentTarget as HTMLButtonElement)}>
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
