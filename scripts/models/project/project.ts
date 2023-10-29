import { WebpackRunner } from '../webpack/runner';

import type { WebpackConfiguration } from '../webpack/configuration/base';
import type { Port } from 'webpack-dev-server';

export enum EProjectType {
  Consumer = 'Consumer',
  Provider = 'Provider'
}

export abstract class Project extends WebpackRunner {
  constructor(projectDir: string, devConfiguration: WebpackConfiguration, buildConfiguration: WebpackConfiguration, port?: Port) {
    super(projectDir, devConfiguration, buildConfiguration, port);
  }
}
