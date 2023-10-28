import { ProjectFactory } from '../factories/project';

import { Command } from './command';

export class DevCommand extends Command {
  async execute() {
    const project = ProjectFactory.create();
    project.serve();
  }
}
