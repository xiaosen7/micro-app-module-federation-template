import merge from 'webpack-merge';

import { moduleFederationUtils } from '../../../utils/module-federation';
import { AppManifestsPlugin } from '../plugins/app-manifests';
import { ModuleFederationProviderPlugin } from '../plugins/provider';

import { WebpackDevConfiguration } from './dev';

export class ProviderDevConfiguration extends WebpackDevConfiguration {
  get() {
    return merge(super.get(), {
      plugins: [
        new ModuleFederationProviderPlugin(),
        new AppManifestsPlugin(),
        ...['react/jsx-dev-runtime', 'react/jsx-runtime'].map(moduleFederationUtils.createProviderReplacerPlugin)
      ]
    });
  }
}
