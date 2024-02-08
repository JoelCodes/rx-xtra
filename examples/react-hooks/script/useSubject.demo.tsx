import { useState } from 'react';
import { useSubject, useSubscribe } from 'rx-xtra.react-hooks';
import { Observable, Observer } from 'rxjs';

function ObserverEnd({output}:{output:Observer<string>}){
  const [line, setLine] = useState<string>('');
  return <td>
    <h3>Observer End</h3>
    <p>
      <input type='text' value={line} onChange={({target:{value}}) => { setLine(value); }}/>
      <button onClick={() => {
        output.next(line);
        setLine('');
      }}>Send</button>
    </p>
    
  </td>;
}
function ObservableEnd({input$}:{input$:Observable<string>}){
  const [lines, setLines] = useState<string[]>([]);

  useSubscribe(() => input$.subscribe((line) => setLines(lines => [
    ...lines.slice(Math.max(0, lines.length - 9)),
    line
  ])));

  return <td>
    <h3>Observable End</h3>
    <pre>
      {lines.join('\n')}
    </pre>
  </td>;
}


export function UseSubjectDemo(){
  const subj = useSubject<string>();
  return <div>
    <h2><code>useSubject</code> Demo</h2>
    <table>
      <tr>
        <ObserverEnd output={subj}/>
        <ObservableEnd input$={subj}/>
      </tr>
    </table>
  </div>;
}