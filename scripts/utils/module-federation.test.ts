import { expect, describe, test } from 'vitest';

import { moduleFederationUtils } from './module-federation';

describe('module-federation', () => {
  test(moduleFederationUtils.srcFilePathToExposeKey, () => {
    expect(moduleFederationUtils.srcFilePathToExposeKey('./src/antd/index.ts')).toBe('./antd');
    expect(moduleFederationUtils.srcFilePathToExposeKey('./src/antd.ts')).toBe('./antd');
  });
});
