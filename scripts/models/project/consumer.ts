import { ConsumerBuildConfiguration } from '../webpack/configuration/consumer-build';
import { ConsumerDevConfiguration } from '../webpack/configuration/consumer-dev';

import { Project } from './project';

export interface IProviderProjectOptions {}

export class ConsumerProject extends Project {
  build(): void {
    this.runner.build(new ConsumerBuildConfiguration(), this);
  }

  serve(): void {
    this.runner.serve(new ConsumerDevConfiguration(), this);
  }
}
