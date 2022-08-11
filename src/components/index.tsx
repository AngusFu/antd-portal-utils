import AntdDrawer from 'antd/es/drawer';
import AntdModal from 'antd/es/modal';

import { withAntdPortalUtilsAdaptor } from './hoc';

export const Drawer = /* #__PURE__*/ withAntdPortalUtilsAdaptor(AntdDrawer);
export const Modal = /* #__PURE__*/ withAntdPortalUtilsAdaptor(AntdModal);

export { default as PopConfirm } from './pop-confirm';
export { default as ImagePreview } from './image-preview';
