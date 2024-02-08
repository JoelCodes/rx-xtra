import { useState } from 'react';
import { useSubscribe } from 'rx-xtra.react-hooks';
import { interval, tap } from 'rxjs';

function UseSubscribeDemoComp({onEvent}: {onEvent:(event:string) => void}){
  useSubscribe(() => {
    return interval(1000).pipe(tap({
      finalize() {
        onEvent('Finalize');
      },
      subscribe() {
        onEvent('Subscribe');
      },
      unsubscribe(){
        onEvent('Unsubscribe');
      },
    })).subscribe({
      next(value) {
        onEvent(`Next: ${value}`);
      },
      complete() {
        onEvent('Complete');
      },
      error(err) {
        onEvent(`Error: ${err}`);
      },
    });
  });
  return null;
}

export function UseSubscribeDemo(){
  const [subscribed, setSubscribed] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  return <div>
    <h2><code>useSubscribe</code> Demo</h2>
    <button onClick={() => setSubscribed(s => !s)}>{subscribed ? 'Unsubscribe' : 'Subscribe'}</button>
    <pre>{output.join('\n')}</pre>
    {subscribed && <UseSubscribeDemoComp onEvent={(val) => {
      setOutput(output => [...output.slice(Math.max(0, output.length - 9)), val]);
    }}/>}
  </div>;
}
