import { ProjectFactory } from '../factories/project';

import { Command } from './command';

export class BuildCommand extends Command {
  async execute() {
    const project = ProjectFactory.create();
    project.build();
  }
}
