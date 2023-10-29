import { ProviderBuildConfiguration } from '../webpack/configuration/provider-build';
import { ProviderDevConfiguration } from '../webpack/configuration/provider-dev';

import { Project } from './project';

export interface IProviderProjectOptions {}

export class ProviderProject extends Project {
  constructor(projectDir: string) {
    super(projectDir, new ProviderDevConfiguration(projectDir), new ProviderBuildConfiguration(projectDir));
  }
}
