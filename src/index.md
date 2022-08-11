# Usage

## Install

```bash
npm install antd-portal-utils
```

## usePortal

Use `usePortal` to get contextHolder with context accessible issue.

This is inspired by the `Modal.useModal` API in [Ant Design](<https://ant-design.gitee.io/components/modal/#Modal.useModal()>).

<code src="./demo/use-portal-with-ctx.tsx" />

<br />

### For Mac users

<Alert type="warning">
  If you met a unexpected shifting of the position of the Popconfirm component, it's NOT caused by this library.
  <br />
  <br />
  Checkout this <a href="https://codesandbox.io/s/antd-portal-utils-demo-r9t1hc" target="_blank" rel="noopener noreferrer">codesandbox</a>, you'll see everything fine.
  <br />
  <br />
  The following example from antd official website also have the same issue.
</Alert>

```tsx
import { Popconfirm } from 'antd';
import React from 'react';

const App: React.FC = () => (
  <Popconfirm title="Are you sure？" okText="Yes" cancelText="No">
    <a href="#">Delete</a>
  </Popconfirm>
);

export default App;
```

## Preview Image

<code src="./demo/preview-image.tsx" />

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

## Hacks

You can use [babel-plugin-library-aliases](https://github.com/AngusFu/babel-plugin-library-aliases) to override the `Modal` and `Drawer` components.

```js
// in your babel.config.js:

module.exports{
  // ... other fields
  plugins: [
    // ... other plugins
    [
      'babel-plugin-library-aliases',
      {
        'antd': {
          aliases: {
            Modal: 'antd-portal-utils#Modal',
            Drawer: 'antd-portal-utils#Drawer',
          }
        }
      }
    ]
  ];
}
```
