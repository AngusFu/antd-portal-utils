import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'antd-portal-utils',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  base: '/antd-portal-utils',
  publicPath: '/antd-portal-utils/',
  hash: true,
  // more config: https://d.umijs.org/config
  mfsu: {},
  webpack5: {},
});
