import { ConsumerBuildConfiguration } from '../webpack/configuration/consumer-build';
import { ConsumerDevConfiguration } from '../webpack/configuration/consumer-dev';

import { Project } from './project';

export interface IProviderProjectOptions {}

export class ConsumerProject extends Project {
  constructor(projectDir: string) {
    super(projectDir, new ConsumerDevConfiguration(projectDir), new ConsumerBuildConfiguration(projectDir));
  }
}
