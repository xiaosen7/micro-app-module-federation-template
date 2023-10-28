import { ShareAltOutlined } from 'modules/@ant-design/icons';
import { useRequest } from 'modules/ahooks';
import { Spin, List, Switch } from 'modules/antd';
import { appManifests } from 'modules/app-manifests';
import classnames from 'modules/classnames';
import { useSubscribe, MicroUtils } from 'modules/common';
import { useCallback } from 'modules/react';
import { merge } from 'modules/rxjs';

import { MicroAppDevServer } from '@/models/micro-app-dev-server';

export function Micro() {
  const { data, loading, refresh } = useRequest(() => MicroAppDevServer.get().getRunningApps());

  useSubscribe(
    merge(MicroAppDevServer.get().closedApp$, MicroAppDevServer.get().startedApp$),
    () => {
      refresh();
    },
    [refresh]
  );

  return (
    <Spin spinning={loading}>
      <List
        dataSource={Object.keys(MicroUtils.getMicroAppPorts()) as IMicroAppName[]}
        renderItem={(appName: IMicroAppName) => {
          return (
            <List.Item key={appName}>
              <AppSwitch className='w-full' appName={appName} value={!!data?.includes(appName)} afterSwitch={refresh} />
            </List.Item>
          );
        }}
      />
    </Spin>
  );
}

function AppSwitch(props: { appName: IMicroAppName; value: boolean; afterSwitch: () => void } & IComponentBaseProps) {
  const { appName, afterSwitch, value, className, style } = props;
  const { run, loading } = useRequest((start: boolean) => (start ? MicroAppDevServer.get().start(appName) : MicroAppDevServer.get().close(appName)), {
    manual: true,
    onSuccess() {
      afterSwitch();
    }
  });

  const onSwitch = useCallback(
    (value: boolean) => {
      run(value);
    },
    [run, afterSwitch]
  );

  return (
    <div className={classnames('flex gap-1 items-center', className)} style={style}>
      <span className='flex-1'>{appName}</span>
      <span>{appManifests[appName]?.description}</span>
      <Switch title={value ? '已启动' : '已关闭'} loading={loading} onChange={onSwitch} checked={value} />
      <ShareAltOutlined
        onClick={() => MicroUtils.openMicroApp(appName)}
        title='新窗口中打开'
        className='cursor-pointer text-gray-500 hover:text-black'
      />
    </div>
  );
}
