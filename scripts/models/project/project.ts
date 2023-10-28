import path from 'path';

import fsx from 'fs-extra';
import ports from 'root/ports.json';

import { invariantUtils } from '../../utils/invariant';
import { WebpackRunner } from '../webpack/runner';

import type { PackageManifest } from '@pnpm/types';

export enum EProjectType {
  Consumer = 'Consumer',
  Provider = 'Provider'
}

export abstract class Project {
  manifest: PackageManifest;
  runner: WebpackRunner;

  constructor() {
    this.manifest = fsx.readJSONSync(path.resolve('package.json'));
    this.runner = new WebpackRunner();
  }

  getPort() {
    const ret = ports[this.manifest.name! as keyof typeof ports];
    invariantUtils.define(ret);
    return ret;
  }

  abstract build(): void;

  abstract serve(): void;
}
