import { useRef, useState } from 'react';
import { useObserveChanges, useSubscribe } from 'rx-xtra.react-hooks';
import { debounceTime, map, withLatestFrom } from 'rxjs';


function SubComp({a}:{a:number, onEvent(text:string|number):void}){
  const a$ = useObserveChanges([a]);
  const [b, setB] = useState(0);
  const b$ = useObserveChanges([b]);

  const preRef = useRef<HTMLPreElement>(null);

  useSubscribe(() => a$.pipe(
    withLatestFrom(b$),
    map(([[a], [b]]) => `a: ${a}; b: ${b}; a * b ${a * b}`),
    debounceTime(1000)
  ).subscribe((value) => {
    if(!preRef.current) return;
    preRef.current.innerText += `${value}\n`;
  }));

  return <>
    <p>
      <button onClick={() => setB(b - 1)}>-</button>
      &nbsp;{b}&nbsp;
      <button onClick={() => setB(b + 1)}>+</button>
      &nbsp; ← This one updates the &ldquo;b&rdquo; value, but trigger no change.
    </p>
    <pre ref={preRef}/>
  </>;
}

export function UseObserveChangesDemo(){
  const [a, setA] = useState(0);
  
  return <div>
    <h2><code>useObserveChanges</code> Demo</h2>
    <p>This operates like `useObserve`, but there are no updates until a and b both update once.</p>
    <p>
      <button onClick={() => setA(a - 1)}>-</button>
      &nbsp;{a}&nbsp;
      <button onClick={() => setA(a + 1)}>+</button>
      &nbsp; ← This one will trigger a print (but debounced by a second)
    </p>
    <SubComp a={a} onEvent={console.log}/>

  </div>;
}