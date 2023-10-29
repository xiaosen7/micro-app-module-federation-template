// #region micro
// type IAppName = keyof typeof import('root/ports.json');
type IAppName = string;
type IExtractMicroAppName<T extends string, B = T> = B extends `@micro/${string}` ? (B extends '@micro/modules' ? never : B) : never;
type IMicroAppName = IExtractMicroAppName<IAppName>;
// #endregion micro

declare const process = {
  env: {
    NODE_ENV: 'development' | 'production'
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ISafeAny = any;
type IAnyFunction = (...args: ISafeAny[]) => ISafeAny;

declare module 'modules/react' {
  import React from 'react';
  export = React;
}

type IComponentBaseProps<T = {}> = T & {
  className?: string;
  style?: import('react').CSSProperties;
};
