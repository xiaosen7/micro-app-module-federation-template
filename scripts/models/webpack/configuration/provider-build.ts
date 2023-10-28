import merge from 'webpack-merge';

import { moduleFederationUtils } from '../../../utils/module-federation';
import { ModuleFederationProviderPlugin } from '../plugins/provider';

import { WebpackBuildConfiguration } from './build';

export class ProviderBuildConfiguration extends WebpackBuildConfiguration {
  get() {
    return merge(super.get(), {
      plugins: [
        new ModuleFederationProviderPlugin(),
        ...['react/jsx-dev-runtime', 'react/jsx-runtime'].map(moduleFederationUtils.createConsumerReplacerPlugin)
      ]
    });
  }
}
