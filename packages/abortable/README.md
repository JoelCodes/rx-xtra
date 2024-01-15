# Rx Xtra: Abortable

`rx-xtra.abortable` is part of [`Rx Xtra`](https://github.com/JoelCodes/rx-xtra), a collection of [RxJS](https://rxjs.dev/) utilities.

Created by Joel Shinness [LinkTree](https://linktr.ee/yesthatjoelshinness) • [Github](https://github.com/JoelCodes) • [Buy me a coffee!](https://ko-fi.com/yesthatjoelshinness)

## Usage

`abortable<T>`

* Parameters
  * `factory`: `(signal:AbortSignal) => ObservableInput<T>` Accepts an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) and returns an [`ObservableInput<T>`](https://rxjs.dev/api/index/type-alias/ObservableInput), e.g. an [`Observable<T>`](https://rxjs.dev/api/index/class/Observable), or anything that can be coerced into an `Observable<T>`, such as an Array, Promise, Iterable, or AsyncIterable.
* Returns
  * [`Observable<T>`](https://rxjs.dev/api/index/class/Observable)


Abortable allows functions and API's that use the [AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) for cleanup to receive that signal when the subscription ends.

## Examples

```ts

// This represents some API that uses an AbortSignal to perform cleanup
// In this case, it ends the loop.
async function *countUntilAbort(signal:AbortSignal):AsyncIterable<number>{
  for(let i = 1; true; i++){
    await new Promise(resolve => setTimeout(resolve, 1000));
    if(signal.aborted) {
      console.log('Aborted');
      break;
    }
    yield i;
  }
  
}

abortable(countUntilAbort)
  .pipe(take(3))
  .subscribe({
    next(val){ console.log('Next', val); },
    complete(){ console.log('Complete'); },
    error(err){ console.log('Error', err); }
  });

// CONSOLE:
// Next 1
// Next 2
// Next 3
// Complete
// Aborted
```
