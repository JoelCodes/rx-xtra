
import { createRoot } from 'react-dom/client';
import { UseSubscribeDemo } from './useSubscribe.demo';
import { UseObserveDemo } from './useObserve.demo';
import { UseObserveChangesDemo } from './useObserveChanges.demo';
import { UseSubjectDemo } from './useSubject.demo';

function App(){
  return <>
    <h1>Rx Xtra React Hooks</h1>
    <UseSubscribeDemo/>
    <hr/>
    <UseObserveDemo/>
    <hr/>
    <UseObserveChangesDemo/>
    <hr/>
    <UseSubjectDemo/>
  </>;
}


createRoot(document.getElementById('root')!).render(<App/>);