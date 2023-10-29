import { cwd } from 'process';

import { firstValueFrom } from 'rxjs';

import { pathUtils } from '../../utils/paths';
import { ProjectFactory } from '../factories/project';
import { EProjectType } from '../project/project';

import { Command } from './command';

export class DevCommand extends Command {
  async execute() {
    if (cwd() === pathUtils.workspaceRoot) {
      await this.devRoot();
    } else {
      await this.devProject();
    }
  }

  async devRoot() {
    const modules = ProjectFactory.create(EProjectType.Provider, pathUtils.getAppProjectDir('@micro/modules'));
    modules.serve();
    await firstValueFrom(modules.portsWritten$);

    const mainApp = ProjectFactory.create(EProjectType.Consumer, pathUtils.getAppProjectDir('@apps/main'));
    mainApp.serve();
  }

  async devProject() {
    const project = ProjectFactory.create();
    project.serve();
  }
}
