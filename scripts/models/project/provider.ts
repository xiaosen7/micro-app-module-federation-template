import { ProviderBuildConfiguration } from '../webpack/configuration/provider-build';
import { ProviderDevConfiguration } from '../webpack/configuration/provider-dev';

import { Project } from './project';

export interface IProviderProjectOptions {}

export class ProviderProject extends Project {
  build(): void {
    this.runner.build(new ProviderBuildConfiguration(), this);
  }

  serve(): void {
    this.runner.serve(new ProviderDevConfiguration(), this);
  }
}
