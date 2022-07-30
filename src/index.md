# antd-portal-utils

## Install

```bash
npm install antd-portal-utils
```

## API

### usePortal

Use `usePortal` to get contextHolder with context accessible issue.

This is inspired by the `Modal.useModal` API in [Ant Design](<https://ant-design.gitee.io/components/modal/#Modal.useModal()>).

<code src="./demo/use-portal-with-ctx.tsx" />

### createPortalUtil

Use `createPortalUtil` to create global shared portal methods and context holder.

For example:

```tsx | pure
// file: src/utils/index.ts

import { createPortalUtil } from 'antd-portal-utils';

const { contextHolder, methods } = createPortalUtil(
  // A unique key generator is required.
  () => Math.random(),
);
const { openPortal } = methods;

export { contextHolder, openPortal };

// --------------------------------------------------------
// file: src/App.tsx
import React from 'react';
import { contextHolder } from '@/utils';

export default function App() {
  return (
    <Layout>
      <Content />
      {contextHolder}
    </Layout>
  );
}

// --------------------------------------------------------
// file: src/pages/some-page.tsx
import React from 'react';
import { Modal } from 'antd-portal-utils';
import { openPortal } from '@/utils';

export default function App() {
  const handleOpenModal = () => {
    const { close, update } = openPortal(
      <Modal
        visible={true}
        title="ABC"
        onCancel={() => close()}
        onConfirm={() => update({ title: 'XYZ' })}
        {...otherProps}
      />,
    );
  };

  return (
    <div>
      <button onClick={handleOpenModal}>Open Modal</button>
    </div>
  );
}
```
