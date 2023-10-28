import merge from 'webpack-merge';

import { moduleFederationUtils } from '../../../utils/module-federation';
import { ModuleFederationConsumerPlugin } from '../plugins/consumer';

import { WebpackBuildConfiguration } from './build';

export class ConsumerBuildConfiguration extends WebpackBuildConfiguration {
  get() {
    return merge(super.get(), {
      plugins: [
        new ModuleFederationConsumerPlugin({ isDev: false }),
        ...['react/jsx-dev-runtime', 'react/jsx-runtime'].map(moduleFederationUtils.createConsumerReplacerPlugin)
      ]
    });
  }
}
