import type { Key } from 'react';
import { useCreation, useMemoizedFn } from 'ahooks';
import { createPortalUtil } from './internals';

export * from './hooks';
export { Drawer, Modal, PopConfirm } from './components';

export type {
  OpenPortalResult,
  OpenPortalType,
  OpenPopConfirmResult,
  OpenPopConfirmType,
} from './internals';
export { createPortalUtil };

export function usePortal(keyGenerator?: () => Key) {
  const keyGen = useMemoizedFn(keyGenerator || defaultKeyGenerator);
  const { contextHolder, methods } = useCreation(() => createPortalUtil(keyGen), []);

  return [methods, contextHolder] as const;
}

function defaultKeyGenerator() {
  return Math.random().toString(32).slice(2);
}
