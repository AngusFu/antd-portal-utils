import AntdDrawer from 'antd/es/drawer';
import AntdModal from 'antd/es/modal';

import { withAntdPortalUtilsAdaptor } from './hoc';

export const Drawer = /* #__PURE__*/ withAntdPortalUtilsAdaptor(AntdDrawer, {
  afterVisibleChangeType: 'afterVisibleChange',
});
export const Modal = /* #__PURE__*/ withAntdPortalUtilsAdaptor(AntdModal, {
  afterVisibleChangeType: 'afterClose',
});
export { default as PopConfirm } from './pop-confirm';
