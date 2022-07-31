# Usage

## Install

```bash
npm install antd-portal-utils
```

## usePortal

Use `usePortal` to get contextHolder with context accessible issue.

This is inspired by the `Modal.useModal` API in [Ant Design](<https://ant-design.gitee.io/components/modal/#Modal.useModal()>).

<code src="./demo/use-portal-with-ctx.tsx" />

## createPortalUtil

Use `createPortalUtil` to create global shared portal methods and context holder.

For example:

```tsx | pure
// file: src/utils/index.ts

import { createPortalUtil } from 'antd-portal-utils';

// A unique key generator is required.
const { contextHolder, methods } = createPortalUtil(() => Math.random());
const { openPortal, openPopConfirm } = methods;

export { contextHolder, openPortal, openPopConfirm };

// --------------------------------------------------------
// file: src/App.tsx
export default function App() {
  return (
    <Layout>
      <Content />
      {contextHolder}
    </Layout>
  );
}
```

#### Demo: previewImage

<code src="./demo/preview-image.tsx" />
