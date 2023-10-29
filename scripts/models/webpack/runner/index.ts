import path from 'path';

import chalk from 'chalk';
import fsx from 'fs-extra';
import { Subject } from 'rxjs';
import { webpack } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { invariantUtils } from '../../../utils/invariant';
import { pathUtils } from '../../../utils/paths';

import { setupMiddlewares } from './middleware';

import type { WebpackConfiguration } from '../configuration/base';
import type { PackageManifest } from '@pnpm/types';
import type { Port } from 'webpack-dev-server';

export class WebpackRunner {
  private server?: WebpackDevServer;

  started$ = new Subject<Port>();
  stopped$ = new Subject();
  portsWritten$ = new Subject<Port>();

  isServing = false;

  packageJson: PackageManifest;

  constructor(
    private projectDir: string,
    private devConfiguration: WebpackConfiguration,
    private buildConfiguration: WebpackConfiguration,
    private port?: Port
  ) {
    this.packageJson = fsx.readJSONSync(path.resolve(projectDir, 'package.json'));

    this.started$.subscribe(async (port) => {
      await fsx.ensureFile(pathUtils.resolveWorkspaceRoot('ports.json'));
      let json;
      try {
        json = await fsx.readJSON(pathUtils.resolveWorkspaceRoot('ports.json'));
      } catch (error) {
        json = {};
      }

      json[this.packageJson.name] = port;
      await fsx.writeJSON(pathUtils.resolveWorkspaceRoot('ports.json'), json);
      this.portsWritten$.next(port);
    });
  }

  build() {
    const compiler = webpack(
      this.buildConfiguration.merge({
        output: {
          publicPath: `/micro/${this.packageJson.name.replace('@micro/', '')}/`
        },
        context: this.projectDir
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

  serve() {
    this.isServing = true;
    this.createWebpackDevServer(this.devConfiguration).then((x) => x.startCallback(this.startServerCallback));
  }

  stopServe() {
    invariantUtils.define(this.server);
    this.server.stopCallback(this.stopServerCallback);
  }

  private async createWebpackDevServer(configuration: WebpackConfiguration) {
    const host = 'localhost';
    this.port = this.port ?? (await WebpackDevServer.getFreePort('auto', 'localhost'));

    const devServerConfig: WebpackDevServer.Configuration = {
      port: this.port,
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

    const config = configuration.merge({
      output: {
        publicPath: `http://localhost:${this.port}/`
      },
      context: this.projectDir
    });
    const compiler = webpack(config);
    this.server = new WebpackDevServer(devServerConfig, compiler);
    return this.server;
  }

  private stopServerCallback = () => {
    this.isServing = false;
    this.stopped$.next(null);

    this.server!.logger.info(`${chalk.green(this.packageJson.name)} stopped.`);
  };

  private startServerCallback = async () => {
    const { server, packageJson, port } = this;

    invariantUtils.define(server);
    invariantUtils.define(port);

    this.started$.next(port);

    const host = 'localhost';
    const localAddress = `http://${host}:${port}/`;
    const ipv4Address = `http://${(await WebpackDevServer.internalIP('v4')) || host}:${port}`;

    server.logger.info(`${chalk.green('🎉 本地地址：')}${chalk.cyanBright(localAddress)}`);
    server.logger.info(`${chalk.green('🎉 网络地址：')}${chalk.cyanBright(ipv4Address)}`);
    server.logger.info(`${chalk.green(packageJson.name)} started successfully.`);
  };
}
