import React, { createContext } from 'react';

import { usePortal, Drawer, Modal, PopConfirm } from 'antd-portal-utils';

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
  const [{ openPortal, openPopConfirm }, contextHolder] = usePortal();
  const [childPortalUtil, childPortalContextHolder] = usePortal();

  const handleOpenDrawer = function () {
    const { close } = openPortal(
      <Drawer visible={true} title="Hello World" onClose={() => close()}>
        {content}
        <br />
        <Button
          style={{ margin: '200px 0 200px' }}
          onClick={(e) => handleOpenPopConfirm(e.currentTarget as HTMLButtonElement)}
        >
          Open PopConfirm
        </Button>

        <br />
        <br />

        <Button
          style={{ margin: '0 0 100vh' }}
          onClick={(e) => {
            const { close } = childPortalUtil.openPortal(
              <Drawer visible onClose={() => close()} getContainer={() => document.body}>
                Hi there
              </Drawer>,
            );
          }}
        >
          Open Child Drawer
        </Button>

        {childPortalContextHolder}
      </Drawer>,
    );
  };

  const handleOpenModal = function () {
    const { close } = openPortal(
      <Modal visible={true} onCancel={() => close()}>
        {content}
      </Modal>,
    );
  };

  const handleOpenPopConfirm = async function (el: HTMLElement) {
    // NOTE the difference
    const { close, update } = openPopConfirm(
      el,
      <PopConfirm
        title="Confirm to delete?"
        overlayStyle={{ width: 300 }}
        placement="topRight"
        onCancel={() => close()}
      />,
    );

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
      <Space direction="vertical" size={18}>
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
