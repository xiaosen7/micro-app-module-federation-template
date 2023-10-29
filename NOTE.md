# micro-app-module-federation-template

## 简介

这一次接到需求需要做一个多个公司产品项目集合的前端工程，需要对前端模块拆分。

主要功能点如下：

使用 micro-app 和 Webpack 模块联邦实现微前端，提取公共依赖，提高子应用启动速度，减少打包后大小

实现懒启动子应用，开发者无需手动启动子应用，进入子应用页面以后后台自动启动子应用，离开子应用页面以后过段时间自动关闭后台进程。

实现开发小助手固钉，可定位页面元素到源代码并打开 VSCode ，以表格形式展示子应用描述，启动或关闭子应用。

## 目录介绍

pnpm-workspace.yaml

```yaml
packages:
  # 主应用
  - 'apps/*'

  # 共享应用
  - 'micro/*'

  # 共享模块
  - 'shared/*'

  # 脚本模块
  - 'scripts'
```

```bash
.
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── nx.json
├── apps # 主应用列表
│   └── main
│       └── package.json # @apps/main
├── micro # 微应用列表
│   ├── login # 登录页面
│   │   └── package.json # @micro/login
│   └── modules # 我们会把该模块作为 Webpack 模块联邦的提供者
│       └── package.json # @micro/modules
├── scripts # 项目工程化文件存放位置
│   └── package.json
└── shared # 公共模块
    ├── common # 应用公共模块，如 utils 等
    │   └── package.json
    └── tsconfig # 项目 tsconfig 公共配置
        └── package.json # @shared/tsconfig
```

## 模块联邦的实现

micro/modules 这个项目模块作为 Webpack 的模块联邦提供者，也就是项目公共依赖提供方，我们希望项目中的其他应用在使用三方依赖时从 modules 里导入，也就是说

项目中的导入语句

```tsx
import { createRoot } from 'react-dom/client';
```

变成

```tsx
import { createRoot } from 'modules/react-dom/client';
```

那么如何才能在 modules 中暴露出三方模块供外部使用呢？换句话说，我们在 modules 中需要怎么写代码？

我们可以在 modules/src 目录下创建我们需要暴露出去的模块，比如说 micro/modules/src/react/index.ts 这个文件

```ts
export * from 'react';
export { default } from 'react';
```

然后在我们的 apps/main 应用项目里配置下 tsconfig.json 文件：

```json
{
  "extends": "@shared/tsconfig",
  "compilerOptions": {
    "paths": {
      "modules/*": ["../../micro/modules/src/*"]
    }
  }
}
```

这样我们就能在 main 这个主应用的代码中使用 modules 里的三方模块导入语句有智能提示了。

除此之外，我们还需要使用 webpack 提供的 ModuleFederationPlugin 插件，将 modules 项目设置为模块提供方，将主应用或者其他微应用作为消费者，从而实现模块联邦。

作为消费者（主应用以及其他微应用），我定义了一个 ModuleFederationConsumerPlugin 模块联邦消费者的插件

```ts
import ports from 'root/ports.json';
import { container } from 'webpack';

export class ModuleFederationConsumerPlugin extends container.ModuleFederationPlugin {
  constructor(options: { isDev: boolean }) {
    super({
      remotes: {
        modules: options.isDev ? `modules@http://localhost:${ports['@micro/modules']}/remoteEntry.js` : `modules@/micro/modules/remoteEntry.js`
      }
    });
  }
}
```

这里区分了开发环境和线上环境，启动应用的开发服务器时，我们总是会启动 modules 的开发服务器，因为它是模块提供者。

下面是作为提供者的 modules 模块使用到的插件：

```ts
import { cwd } from 'process';

import { container } from 'webpack';

import { moduleFederationUtils } from '../../../utils/module-federation';

export class ModuleFederationProviderPlugin extends container.ModuleFederationPlugin {
  constructor() {
    const exposes = moduleFederationUtils.filePathsToExposes(moduleFederationUtils.resolveCodeFiles(cwd()));
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
```

这里我们拿到 modules 项目中的所有 src 中的代码文件，然后生成一个 exposes 对象作为选项传入 ModuleFederationPlugin 这个插件，从而暴露了在 modules 项目中的所有在 src 中写的那些文件，可以看一下 exposes 长什么样子：

```bash
==================ModuleFederationProviderPlugin=========================
{
  exposes: {
    './app-manifests': './src/app-manifests.ts',
    '.': './src/index.tsx',
    './@micro-zoe/micro-app': './src/@micro-zoe/micro-app.ts',
    './ahooks': './src/ahooks/index.ts',
    './antd': './src/antd/index.ts',
    './antd-token-previewer': './src/antd-token-previewer/index.ts',
    './classnames': './src/classnames/index.ts',
    './common': './src/common/index.ts',
    './lodash-es': './src/lodash-es/index.ts',
    './react': './src/react/index.ts',
    './react/jsx-dev-runtime': './src/react/jsx-dev-runtime.ts',
    './react/jsx-runtime': './src/react/jsx-runtime.ts',
    './react-dev-inspector': './src/react-dev-inspector/index.ts',
    './react-dom/client': './src/react-dom/client.ts',
    './react-dom': './src/react-dom/index.ts',
    './rxjs': './src/rxjs/index.ts',
    './@ant-design/icons': './src/@ant-design/icons/index.ts',
    './@pnpm/types': './src/@pnpm/types/index.ts',
    './@shared/common': './src/@shared/common/index.ts',
    './@micro-zoe/micro-app/polyfill/jsx-custom-event': './src/@micro-zoe/micro-app/polyfill/jsx-custom-event.ts'
  }
}
==================ModuleFederationProviderPlugin=========================
```

这里的 modules 也是作为一个应用需要部署在线上，只不过它只作为模块提供方而没有任何的业务功能。

## MicroApp 的接入过程

### 在 modules 项目中暴露出 MicroApp 相关 API

前面说到，我们项目的所有三房模块都从 modules 暴露出来，首先在 modules 项目中安装 MicroApp

`pnpm -F=modules i @micro-zoe/micro-app`

我们需要创建一个 micro/modules/src/@micro-zoe/micro-app/index.ts 文件：

```ts
export * from '@micro-zoe/micro-app';
export { default } from '@micro-zoe/micro-app';
```

还有 micro/modules/src/@micro-zoe/micro-app/polyfill/jsx-custom-event.ts 这个文件：

```ts
export * from '@micro-zoe/micro-app/polyfill/jsx-custom-event';
export { default } from '@micro-zoe/micro-app/polyfill/jsx-custom-event';
```

### 微应用 login

micro/login/src/index.ts：

```ts
import('./bootstrap');
```

micro/login/src/bootstrap.tsx：

```tsx
import { createRoot } from 'modules/react-dom/client';

createRoot(document.getElementById('root')!).render(<h1>login</h1>);
```

### 主应用

apps/main/src/index.ts：

```ts
import('./bootstrap');
```

apps/main/src/bootstrap.tsx

```tsx
/** @jsxRuntime classic */
/** @jsx jsxCustomEvent */
import jsxCustomEvent from 'modules/@micro-zoe/micro-app/polyfill/jsx-custom-event';
import microApp from 'modules/@micro-zoe/micro-app';
import { createRoot } from 'modules/react-dom/client';

import { DevTools } from './components/dev-tools';
import { MicroApp } from './components/micro-app';

// 需要保留，否则 eslint 自动修复会把导入语句去掉
jsxCustomEvent;

microApp.start({
  lifeCycles: {
    error(e) {
      console.log('error', e);
    }
  }
});

createRoot(document.getElementById('root')!).render(
    <micro-app
      name={'login'}
      {/* 这里是微应用 login 的开发服务器端口 */}
      url={'http://localhost:5003'}
    />
);
```

### 修改 Webpack 配置

首先我们需要配置开发服务器跨域，用来支持应用间的资源访问：

在 webpack-dev-server 的配置中，我们需要增加响应头部：

```js
headers: {
  'Access-Control-Allow-Origin': '*',
}
```

然后还需要配置应用的 output.publicPath，比如 login 这个微应用模块：

```ts
output: {
  publicPath: isDev ? 'http://localhost:5003/' : '/micro/login/';
}
```

配置 publicPath 的作用是，在微应用被嵌入在其他应用时，自身的资源路径得以拼接正确。

### 启动过程

我们首先启动 modules，然后启动微应用 login，最后是主应用 main。

## 构建

以下是打包后的目录结构，实现这个打包结构我们需要合并各个应用的 dist 文件夹。

![dist](./docs/dist.png)

首先修改 Webpack 的 output.publicPath 的配置：

```ts
output: {
  publicPath: `/${this.packageJson.name.replace('@', '')}/`;
}
```

这样如果访问 apps/main 这个应用，访问地址应是：`http://xxx/apps/main/`

如果访问 micro/login 这个应用，访问地址应是：`http://xxx/micro/login/`

下面来实现汇聚各个应用的输出目录：

```ts
import cpy from 'cpy';
import fsx from 'fs-extra';
import fs from 'fs/promises';

await fsx.emptyDir(pathUtils.resolveWorkspaceRoot('dist'));

// 拷贝所有主应用的 dist 文件夹
const apps = (await fs.readdir('./apps')).filter((x) => !(x.startsWith('.') || x.startsWith('_')));
await Promise.all(
  apps.map(async (x) => {
    await cpy(path.join(pathUtils.workspaceRoot, `./apps/${x}/dist/**`), pathUtils.resolveWorkspaceRoot(`./dist/apps/${x}`));
  })
);

// 拷贝所有微应用 dist 文件夹
const microApps = (await fs.readdir('./micro')).filter((x) => !(x.startsWith('.') || x.startsWith('_')));
await Promise.all(
  microApps.map(async (x) => {
    await cpy(path.join(pathUtils.workspaceRoot, `./micro/${x}/dist/**`), pathUtils.resolveWorkspaceRoot(`./dist/micro/${x}`));
  })
);

log.info(`create ${pathUtils.resolveWorkspaceRoot('dist')}`);
```

## 优化

之前的过程对开发体验不友好，各种配置一大堆，维护困难，下面我们来做一些工程优化

### 应用端口汇总文件

我们在项目根目录写一个 ports.json 来存放项目中应用的端口号：

```json
{
  "@apps/main": 8000,
  "@micro/login": 8001,
  "@micro/modules": 8002
}
```

这个 key 就是应用的 package.json 中的 name 字段

### 在主应用中增加微应用管理工具

实现功能如下：

![微前端表格](./docs/micro-table.png)

通过网页来控制子应用的启动和关闭，同时提供一个按钮来在新窗口中打开子应用

实现这个功能我们需要在前端网页通知 NodeJS 新开一个进程来执行启动命令。

我们可以扩展 WebpackDevServer 中间件，网页发送一个消息到后台，后台生成一个命令行命令，然后再执行，就可以了。

#### 中间件的实现

首先我们抽象出 AppProcess 作为应用启动进程这一个功能的类

```ts
class AppProcess {
  private appName: IAppName;
  running: boolean = false;
  private process?: ExecaChildProcess<string>;

  constructor(appName: IAppName) {
    this.appName = appName;
  }

  async runStart(afterCreate?: (process: ExecaChildProcess) => void) {
    if (this.running) {
      return;
    }

    this.running = true;
    const cmd = `pnpm -F ${this.appName} dev`;
    const childProcess = execa.command(cmd, {
      cwd: pathUtils.workspaceRoot
    });

    this.process = childProcess;
    afterCreate?.(childProcess);
    return childProcess;
  }

  close() {
    this.process?.kill();
    this.log('已关闭');
    this.running = false;
  }
}
```

然后写一个 AppMap 类来作为应用名称到进程对象的映射表：

```ts
class AppMap extends Map<IAppName, AppProcess> {}
```

socket 处理流程：

```ts
socket.on('message', async (buffer) => {
  const rawData = JSON.parse(buffer.toString());
  const { type, data } = rawData;

  switch (type) {
    case EAppDevSocketType.StartApp: {
      const appName = data as IAppName;
      if (!appMap.has(appName)) {
        appMap.set(appName, new AppProcess(appName));
      }

      // appMap
      const appProcess = appMap.get(appName)!;
      appMap.set(appName, appProcess);

      const afterCreate = (childProcess: ExecaChildProcess) => {
        const onMessage = (message: string) => {
          if (message.includes('started successfully')) {
            console.log(chalk.cyan(`Dev socket: 当前正在运行的微应用： ${appMap.getRunningAppNames()}`) + EOL);
            socket.send(
              JSON.stringify({
                type: EAppDevSocketType.AppStarted,
                data: appName
              })
            );
          }
        };

        childProcess.stdout!.on('data', (buffer) => {
          const message = buffer.toString();
          appProcess.log(message);
          onMessage(message);
        });

        childProcess.stderr!.on('data', (buffer) => {
          const message = buffer.toString();
          appProcess.logError(message);
          onMessage(message);
        });
      };

      await appProcess.runStart(afterCreate);
      appMap.set(appName, appProcess);
      break;
    }

    case EAppDevSocketType.CloseApp: {
      const appName = data as IAppName;
      appMap.get(appName)?.close();
      console.log(chalk.cyan(`Dev socket: 当前正在运行的微应用： ${appMap.getRunningAppNames()}`) + EOL);
      socket.send(
        JSON.stringify({
          type: EAppDevSocketType.AppClosed,
          data: appName
        })
      );
      break;
    }

    default:
      break;
  }
});
```

这样我们就扩展了 Webpack 开发服务器，提供了应用启动控制的功能。

#### 前端向开发服务器通信功能的实现

我们抽象出一个 MicroAppDevServer 的类，来实现启动和关闭微应用的功能。

```ts
import { MicroUtils } from 'modules/@shared/common';
import { Subject, fromEvent } from 'modules/rxjs';
import { EAppDevSocketType } from 'scripts/types';

/**
 * 微前端应用启动控制服务，仅在开发模式下使用
 */
export class MicroAppDevServer {
  private static instance: MicroAppDevServer;

  static get() {
    if (this.instance) {
      return this.instance;
    }

    return (this.instance = new MicroAppDevServer());
  }

  startedApp$ = new Subject<IAppName>();
  closedApp$ = new Subject<IAppName>();

  private ws: WebSocket;
  private isConnected: boolean;

  private constructor() {
    this.ws = new WebSocket(`ws://localhost:${MicroUtils.getAppPort('@apps/main')}/ws`);

    this.isConnected = false;

    fromEvent(this.ws, 'open').subscribe(() => {
      this.isConnected = true;
    });

    fromEvent<MessageEvent>(this.ws, 'message').subscribe((ev) => {
      const rawData = JSON.parse(ev.data);
      const { type, data } = rawData;

      switch (type) {
        case EAppDevSocketType.AppStarted:
          this.startedApp$.next(data);
          break;

        case EAppDevSocketType.AppClosed:
          this.closedApp$.next(data);
          break;

        default:
          break;
      }
    });
  }

  waitConnected() {
    return new Promise((rs) => {
      if (this.isConnected) {
        rs(null);
      }

      setTimeout(() => {
        if (this.isConnected) {
          rs(null);
        }
      }, 200);
    });
  }

  send(type: string, data: ISafeAny) {
    this.waitConnected().then(() => {
      this.ws.send(
        JSON.stringify({
          type,
          data
        })
      );
    });
  }

  start(appName: IAppName) {
    return new Promise((resolve) => {
      this.send(EAppDevSocketType.StartApp, appName);
      const subs = this.startedApp$.subscribe((x) => {
        if (x === appName) {
          subs.unsubscribe();
          resolve(null);
        }
      });
    });
  }

  close(appName: IAppName) {
    return new Promise((resolve) => {
      this.send(EAppDevSocketType.CloseApp, appName);
      const subs = this.closedApp$.subscribe((x) => {
        if (x === appName) {
          subs.unsubscribe();
          resolve(null);
        }
      });
    });
  }
}
```

### 使用 WebpackDevServer api 的方式启动微应用

#### 封装应用启动类

我们可以把命令行启动的方式替换成使用 WebpackDevServer api 的方式来启动，我们先抽象出一个类提供 serve 和 build 方法，然后用这个类来启动应用：

```ts
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

    // 写入 ports.json
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
```

#### 修改中间件处理流程

```ts
class AppMap extends Map<IAppName, Project> {
  getRunningAppNames() {
    return Array.from(this.keys()).filter((name) => this.get(name)?.isServing);
  }
}
```

这里的 Project 其实就是继承自 WebpackRunner 的

```ts
switch (type) {
  case EAppDevSocketType.StartApp: {
    const appName = data as IAppName;
    if (!appMap.has(appName)) {
      appMap.set(appName, ProjectFactory.create(undefined, pathUtils.getAppProjectDir(appName)));
    }

    const appProject = appMap.get(appName)!;
    await appProject.serve();

    appProject.started$.pipe(take(1)).subscribe(() => {
      socket.send(
        JSON.stringify({
          type: EAppDevSocketType.AppStarted,
          data: appName
        })
      );
      logRunningApps();
    });
    break;
  }

  case EAppDevSocketType.CloseApp: {
    const appName = data as IAppName;
    const appProject = appMap.get(appName);
    invariantUtils.define(appProject);
    appProject.stopServe();

    appProject.stopped$.pipe(take(1)).subscribe(() => {
      logRunningApps();
      socket.send(
        JSON.stringify({
          type: EAppDevSocketType.AppClosed,
          data: appName
        })
      );
    });
    break;
  }

  case EAppDevSocketType.RunningApps: {
    socket.send(
      JSON.stringify({
        type: EAppDevSocketType.RunningApps,
        data: appMap.getRunningAppNames()
      })
    );
    break;
  }

  default:
    break;
}
```
