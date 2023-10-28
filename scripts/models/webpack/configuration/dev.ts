import HtmlWebpackPlugin from 'html-webpack-plugin';
import merge from 'webpack-merge';

import { WebpackRawConfigurationFactory } from '../../factories/webpack/raw-configuration';

import { WebpackConfiguration } from './base';

import type { Configuration } from 'webpack';

export class WebpackDevConfiguration extends WebpackConfiguration {
  get(): Configuration {
    const extract = true;
    return merge(
      super.get(),
      {
        mode: 'development',
        devtool: 'cheap-module-source-map',
        plugins: [new HtmlWebpackPlugin()]
      },
      WebpackRawConfigurationFactory.css(extract),
      WebpackRawConfigurationFactory.less(extract)
    );
  }
}
