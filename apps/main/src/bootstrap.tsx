import microApp from 'modules/@micro-zoe/micro-app';
import { envUtils } from 'modules/common';
import { createRoot } from 'modules/react-dom/client';

import './styles/global.css';

import { DevTools } from './components/dev-tools';
import { MicroApp } from './components/micro-app';

microApp.start({
  lifeCycles: {
    error(e) {
      console.log('error', e);
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <>
    <MicroApp appName='@micro/login' />
    {envUtils.isDev() && <DevTools className='fixed right-0 top-2/3' />}
  </>
);
