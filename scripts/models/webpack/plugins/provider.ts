import { container } from 'webpack';

import { moduleFederationUtils } from '../../../utils/module-federation';
import { pathUtils } from '../../../utils/paths';

export class ModuleFederationProviderPlugin extends container.ModuleFederationPlugin {
  constructor() {
    const exposes = moduleFederationUtils.filePathsToExposes(moduleFederationUtils.resolveCodeFiles(pathUtils.getMicroModulesDir()));
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
