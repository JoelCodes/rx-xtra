
import { createRoot } from 'react-dom/client';
import { UseSubscribeDemo } from './useSubscribe.demo';
import { UseObserveDemo } from './useObserve.demo';
import { UseObserveChangesDemo } from './useObserveChanges.demo';
import { UseSubjectDemo } from './useSubject.demo';

function App(){
  return <>
    <UseSubscribeDemo/>
    <UseObserveDemo/>
    <UseObserveChangesDemo/>
    <UseSubjectDemo/>
  </>;
}


createRoot(document.getElementById('root')!).render(<App/>);