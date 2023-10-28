import merge from 'webpack-merge';

import { moduleFederationUtils } from '../../../utils/module-federation';
import { ModuleFederationConsumerPlugin } from '../plugins/consumer';

import { WebpackDevConfiguration } from './dev';

export class ConsumerDevConfiguration extends WebpackDevConfiguration {
  get() {
    return merge(super.get(), {
      mode: 'development',
      devtool: 'cheap-module-source-map',
      plugins: [
        new ModuleFederationConsumerPlugin({ isDev: true }),
        ...['react/jsx-dev-runtime', 'react/jsx-runtime'].map(moduleFederationUtils.createConsumerReplacerPlugin)
      ]
    });
  }
}
