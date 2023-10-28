import { StateMachine, envUtils } from 'modules/@shared/common';

import { MicroAppDevServer } from './micro-app-dev-server';

export enum EAction {
  Render,
  RenderSuccessfully,
  Error,
  FetchError,
  StartServer,
  SuccessfullyStartedServer
}

export enum EState {
  Start,
  Rendering,
  Rendered,
  RenderingError,
  FetchingError,
  StartingServer,
  StartedServer
}

export interface IMicroAppRenderStateMachineOptions {
  appName: IAppName;
}

export class MicroAppRenderingLifecycleMachine extends StateMachine<EState, EAction> {
  static States = EState;
  static Actions = EAction;

  readonly appName: IAppName;

  constructor(options: IMicroAppRenderStateMachineOptions) {
    super(EState.Start);
    const { appName } = options;
    this.appName = appName;

    this.action$.subscribe((x) => console.log('action', EAction[x]));
    this.state$.subscribe((x) => console.log('next state', EState[x]));

    MicroAppDevServer.get().active(appName);

    this.describe('Successfully', (register) => {
      register(EState.Start, EState.Rendering, EAction.Render);
      register(EState.Rendering, EState.Rendered, EAction.RenderSuccessfully);
      register(EState.Rendered, EState.Start, StateMachine.AUTO_ACTION);
    });

    this.describe('Error', (register) => {
      register(EState.Start, EState.Rendering, EAction.Render);
      register(EState.Rendering, EState.RenderingError, EAction.Error);
      register(EState.RenderingError, EState.Start, StateMachine.AUTO_ACTION);
    });

    this.describe('FetchError', (register) => {
      register(EState.Start, EState.Rendering, EAction.Render);
      register(EState.Rendering, EState.FetchingError, EAction.FetchError, () => {
        if (envUtils.isDev()) {
          Promise.resolve().then(() => this.dispatch(EAction.StartServer));
        }
      });
      register(EState.FetchingError, EState.StartingServer, EAction.StartServer, () => {
        MicroAppDevServer.get().start(this.appName);

        const subs = MicroAppDevServer.get().startedApp$.subscribe((appName: IAppName) => {
          console.log('started', appName);
          if (appName === this.appName) {
            subs.unsubscribe();
            this.dispatch(EAction.SuccessfullyStartedServer);
          }
        });
      });
      register(EState.StartingServer, EState.StartedServer, EAction.SuccessfullyStartedServer);
      register(EState.StartedServer, EState.Rendering, StateMachine.AUTO_ACTION);
    });
  }

  dispose() {
    MicroAppDevServer.get().inactive(this.appName);
  }
}
