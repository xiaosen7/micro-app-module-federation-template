/* eslint-disable prettier/prettier */
import { resolve } from 'path';

import * as fg from 'fast-glob';
import { NormalModuleReplacementPlugin } from 'webpack';

export namespace moduleFederationUtils {
  export function resolveCodeFiles(projectDir: string) {
    return fg.sync(['./src/**/*'], {
      cwd: projectDir,
      onlyFiles: true
    });
  }

  export function filePathsToExposes(filePaths: string[]) {
    return filePaths.reduce(
      (acc, cur) => {
        if (!isExcludeKindFile(cur)) {
          acc[srcFilePathToExposeKey(cur)] = cur;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }

  export function isExcludeKindFile(filePath: string) {
    return /\.d\.ts$/.test(filePath);
  }

  export function srcFilePathToExposeKey(filePath: string) {
    return filePath
      .replace('./src/', './')
      .replace('src/', './')
      .replace(/\.tsx?$/, '')
      .replace(/\/index$/, '');
  }

  export function createConsumerReplacerPlugin(module: string) {
    return new NormalModuleReplacementPlugin(new RegExp(`^${module}$`), `modules/${module}`);
  }

  export function createProviderReplacerPlugin(module: string) {
    return new NormalModuleReplacementPlugin(new RegExp(`^${module}$`), (data) => {
      if (!data.contextInfo.issuer.includes(`src/${module}`)) {
        data.request = resolve(`src/${module}.ts`);
      }
    });
  }
}
