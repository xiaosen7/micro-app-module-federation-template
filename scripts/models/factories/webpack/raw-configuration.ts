import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { WebpackLoaderFactory } from './loader';

import type { Configuration } from 'webpack';

export namespace WebpackRawConfigurationFactory {
  export function css(extract?: boolean): Configuration {
    return {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: WebpackLoaderFactory.css(extract)
          }
        ]
      },
      plugins: [extract && new MiniCssExtractPlugin()]
    };
  }

  export function less(extract?: boolean): Configuration {
    return {
      module: {
        rules: [
          {
            test: /\.less$/,
            use: WebpackLoaderFactory.less(extract)
          }
        ]
      },
      plugins: [extract && new MiniCssExtractPlugin()]
    };
  }
}
