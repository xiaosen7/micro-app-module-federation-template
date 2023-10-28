import path from 'path';

import { command } from 'execa';
import fsx from 'fs-extra';
import dedent from 'ts-dedent';

import { log } from '../../utils/log';
import { pathUtils } from '../../utils/paths';

import { Command } from './command';

interface IOptions {}

export class MiCommand extends Command {
  constructor(
    private packages: string[],
    options: IOptions
  ) {
    super(options);
  }

  async execute() {
    await command(`pnpm i -F=@micro/modules ${this.packages.join(' ')}`, {
      stdio: 'inherit'
    });

    await Promise.all(
      this.packages.map(async (packageName) => {
        const sourcePath = path.resolve(pathUtils.workspaceRoot, `micro/modules/src/${packageName}/index.ts`);
        await fsx.ensureFile(sourcePath);
        await fsx.writeFile(
          sourcePath,
          dedent`
    // @ts-ignore
    export { default } from '${packageName}';
    // @ts-ignore
    export * from '${packageName}';

    `
        );
        log.info(`Create ${sourcePath}.`);
      })
    );
  }
}
