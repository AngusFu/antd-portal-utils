import { version as antdVersion } from 'antd';

// https://4x-ant-design.antgroup.com/changelog#4.23.0
export const OPEN_OVER_VISIBLE = parseFloat(antdVersion) >= 4.23;
export const visibilityProp = OPEN_OVER_VISIBLE ? 'open' : 'visible';

export function cloneProperties<T extends Function>(from: T, to: any) {
  Object.keys(from)
    .filter(
      (key) =>
        ![
          'name',
          'length',
          'prototype',
          'displayName',
          // for forwardRefExoticComponent
          'render',
        ].includes(key),
    )
    .forEach((key) =>
      Object.defineProperty(to, key, {
        get() {
          return from[key as keyof typeof from];
        },
      }),
    );
  to.prototype = from.prototype;
}
