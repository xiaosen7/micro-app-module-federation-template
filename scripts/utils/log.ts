import npmlog from 'npmlog';

import { PREFIX } from '../constants';

const apis = ['error', 'log', 'warn', 'info'] as const;
const log = {} as {
  [K in (typeof apis)[number]]: (message: string) => void;
};
apis.forEach((api) => bindApi(npmlog, log, api, PREFIX));

function bindApi(from: Record<string, ISafeAny>, to: Record<string, ISafeAny>, api: string, ...bindArgs: ISafeAny[]) {
  to[api] = from[api].bind(from, ...bindArgs);
}

export { log };
