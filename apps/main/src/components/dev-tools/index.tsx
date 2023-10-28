import { BugOutlined } from 'modules/@ant-design/icons';
import { useToggle } from 'modules/ahooks';
import { Card, Drawer, Tooltip } from 'modules/antd';

import { Inspector } from './tools/inspector';
import { Micro } from './tools/micro';

interface IDevToolsProps extends IComponentBaseProps {}

export function DevTools(props: IDevToolsProps) {
  const { className, style } = props;
  const [isOpen, openActions] = useToggle();
  return (
    <div className={className} style={style}>
      <Tooltip title='打开开发工具抽屉' placement='leftBottom'>
        <BugOutlined onClick={openActions.setRight} className='text-xl text-blue-700 cursor-pointer' />
      </Tooltip>
      <Drawer title='开发工具' mask={false} open={isOpen} onClose={openActions.setLeft}>
        <Content />
      </Drawer>
    </div>
  );
}

function Content() {
  return (
    <div>
      <Card title='调试'>
        <Inspector />
      </Card>

      <Card title='微前端'>
        <Micro />
      </Card>
    </div>
  );
}
