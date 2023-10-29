import fs from 'fs/promises';
import path from 'path';
import { cwd } from 'process';

import cpy from 'cpy';
import { command } from 'execa';
import fsx from 'fs-extra';

import { log } from '../../utils/log';
import { pathUtils } from '../../utils/paths';
import { ProjectFactory } from '../factories/project';

import { Command } from './command';

export class BuildCommand extends Command {
  async execute() {
    if (cwd() === pathUtils.workspaceRoot) {
      await this.buildRoot();
    } else {
      await this.buildProject();
    }
  }

  async buildRoot() {
    await command('pnpm nx run-many -t build', { stdio: 'inherit' });
    await this.mergeDist();
  }

  async buildProject() {
    const project = ProjectFactory.create();
    project.build();
  }

  private async mergeDist() {
    await fsx.emptyDir(pathUtils.resolveWorkspaceRoot('dist'));

    // 拷贝所有主应用的 dist 文件夹
    const apps = (await fs.readdir('./apps')).filter((x) => !(x.startsWith('.') || x.startsWith('_')));
    await Promise.all(
      apps.map(async (x) => {
        await cpy(path.join(pathUtils.workspaceRoot, `./apps/${x}/dist/**`), pathUtils.resolveWorkspaceRoot(`./dist/apps/${x}`));
      })
    );

    // 拷贝所有微应用 dist 文件夹
    const microApps = (await fs.readdir('./micro')).filter((x) => !(x.startsWith('.') || x.startsWith('_')));
    await Promise.all(
      microApps.map(async (x) => {
        await cpy(path.join(pathUtils.workspaceRoot, `./micro/${x}/dist/**`), pathUtils.resolveWorkspaceRoot(`./dist/micro/${x}`));
      })
    );

    log.info(`create ${pathUtils.resolveWorkspaceRoot('dist')}`);
  }
}
