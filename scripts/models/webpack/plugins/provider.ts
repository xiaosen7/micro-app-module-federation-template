import { cwd } from 'process';

import { container } from 'webpack';

import { moduleFederationUtils } from '../../../utils/module-federation';

export class ModuleFederationProviderPlugin extends container.ModuleFederationPlugin {
  constructor() {
    const exposes = moduleFederationUtils.filePathsToExposes(moduleFederationUtils.resolveCodeFiles(cwd()));
    super({
      name: 'modules',
      filename: 'remoteEntry.js',
      exposes
    });

    console.log(`==================${ModuleFederationProviderPlugin.name}=========================`);
    console.log({ exposes });
    console.log(`==================${ModuleFederationProviderPlugin.name}=========================`);
  }
}
