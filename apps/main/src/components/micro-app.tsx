/** @jsxRuntime classic */
/** @jsx jsxCustomEvent */

import jsxCustomEvent from 'modules/@micro-zoe/micro-app/polyfill/jsx-custom-event';
import { MicroUtils, envUtils, useStateMachineState } from 'modules/@shared/common';
import { useUnmount } from 'modules/ahooks';
import { Spin, Typography } from 'modules/antd';
import classnames from 'modules/classnames';
import React, { useEffect, useMemo } from 'modules/react';

import { EState, MicroAppRenderingLifecycleMachine } from '@/models/micro-app-rendering-lifecycle-machine';

import type { ReactElement } from 'modules/react';

// 需要保留，否则 eslint 自动修复会把导入语句去掉
jsxCustomEvent;

export interface IMicroAppProps {
  className?: string;
  appName: IAppName;
  style?: React.CSSProperties;
  baseroute?: string;
  onError?: Function;
}

export function MicroApp(props: IMicroAppProps) {
  return envUtils.isDev() ? <MicroAppDevMode key={props.appName} {...props} /> : <MicroAppProdMode key={props.appName} {...props} />;
}

function MicroAppProdMode(props: IMicroAppProps) {
  const { appName, style, baseroute, className, onError } = props;
  return (
    <micro-app
      baseroute={baseroute}
      class={classnames(className, 'h-full', 'w-full')}
      style={style}
      name={appName}
      onError={onError}
      url={MicroUtils.getAppUrl(appName)}
    />
  );
}

function MicroAppDevMode(props: IMicroAppProps) {
  const { appName } = props;
  const lifecycle = useMemo(() => new MicroAppRenderingLifecycleMachine({ appName }), [appName]);
  const state = useStateMachineState(lifecycle);

  useEffect(() => {
    lifecycle.dispatch(MicroAppRenderingLifecycleMachine.Actions.Render);
  }, [lifecycle]);

  useUnmount(() => {
    lifecycle.dispose();
  });

  const onError = React.useCallback(
    (event: ISafeAny) => {
      if (event.detail?.error?.message?.includes('Failed to fetch')) {
        lifecycle.dispatch(MicroAppRenderingLifecycleMachine.Actions.FetchError);
      } else {
        lifecycle.dispatch(MicroAppRenderingLifecycleMachine.Actions.Error);
      }
    },
    [lifecycle]
  );

  useEffect(() => {
    const port = MicroUtils.getAppPort(appName);
    if (!port) {
      lifecycle.dispatch(MicroAppRenderingLifecycleMachine.Actions.FetchError);
    }
  }, []);

  let node: ReactElement;
  switch (state) {
    case EState.Start:
    case EState.Rendering:
    case EState.Rendered:
    case EState.RenderingError:
    case EState.StartedServer: {
      node = <MicroAppProdMode {...props} onError={onError} />;
      break;
    }

    case EState.FetchingError: {
      node = <Typography.Text type='danger'>请求资源失败</Typography.Text>;
      break;
    }

    case EState.StartingServer: {
      node = (
        <Spin spinning tip={`正在启动 ${appName}...`}>
          {' '}
        </Spin>
      );
      break;
    }
  }

  return node;
}
