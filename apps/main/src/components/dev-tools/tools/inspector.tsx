import { useToggle } from 'modules/ahooks';
import { Button } from 'modules/antd';
import { Inspector as RdInspector, gotoVSCode } from 'modules/react-dev-inspector';

export function Inspector() {
  const [active, actions] = useToggle();

  return (
    <div>
      <Button type='primary' onClick={actions.setRight}>
        在 VSCode 中打开源码文件
      </Button>
      <RdInspector
        active={active}
        onInspectElement={({ codeInfo }) => {
          gotoVSCode(codeInfo);
          actions.setLeft();
        }}
      />
    </div>
  );
}
