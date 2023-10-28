import { SwcMinifyWebpackPlugin } from 'swc-minify-webpack-plugin';
import merge from 'webpack-merge';

import { WebpackRawConfigurationFactory } from '../../factories/webpack/raw-configuration';

import { WebpackConfiguration } from './base';

import type { Configuration } from 'webpack';

export class WebpackBuildConfiguration extends WebpackConfiguration {
  get(): Configuration {
    const extract = true;
    return merge(
      super.get(),
      {
        mode: 'production',
        optimization: {
          minimizer: [new SwcMinifyWebpackPlugin()]
        }
      },
      WebpackRawConfigurationFactory.css(extract),
      WebpackRawConfigurationFactory.less(extract)
    );
  }
}
