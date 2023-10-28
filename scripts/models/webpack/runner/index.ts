import chalk from 'chalk';
import { webpack } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { setupMiddlewares } from './middleware';

import type { Project } from '../../project/project';
import type { WebpackConfiguration } from '../configuration/base';

export class WebpackRunner {
  build(configuration: WebpackConfiguration, project: Project) {
    const compiler = webpack(
      configuration.merge({
        output: {
          publicPath: `/micro/${project.manifest.name.replace('@micro/', '')}/`
        }
      })
    );
    compiler.run(function (err, stats) {
      if (err) {
        throw err;
      }

      process.stdout.write(
        (stats || '').toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + '\n\n'
      );
    });
  }

  async serve(configuration: WebpackConfiguration, project: Project) {
    const port = project.getPort();
    const host = 'localhost';

    const devServerConfig: WebpackDevServer.Configuration = {
      port,
      host,
      https: false,
      static: false,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      client: {
        logging: 'warn',
        progress: true,
        overlay: {
          errors: true,
          warnings: false
        }
      },
      devMiddleware: {
        stats: 'errors-only'
      },
      setupMiddlewares
    };

    const localAddress = `http://${host}:${port}/`;
    const ipv4Address = `http://${(await WebpackDevServer.internalIP('v4')) || host}:${port}`;

    const config = configuration.merge({
      output: {
        publicPath: localAddress
      }
    });
    const compiler = webpack(config);
    const server = new WebpackDevServer(devServerConfig, compiler);

    server.startCallback(() => {
      server.logger.info(`${chalk.green('🎉 本地地址：')}${chalk.cyanBright(localAddress)}`);
      server.logger.info(`${chalk.green('🎉 网络地址：')}${chalk.cyanBright(ipv4Address)}`);
      server.logger.info(`${chalk.green(project.manifest.name)} started successfully.`);
    });
  }
}
