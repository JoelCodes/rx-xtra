# Rx Xtra: Defer Of

`deferOf` is an RxJS creation operator that creates an observable from one value (like [`of`](https://rxjs.dev/api/index/function/of)), but waits until subscription to create that value (like [`defer`](https://rxjs.dev/api/index/function/defer)).

`rx-xtra.defer-of` is part of [`Rx Xtra`](https://github.com/JoelCodes/rx-xtra), a collection of [RxJS](https://rxjs.dev/) utilities.

Created by Joel Shinness [LinkTree](https://linktr.ee/yesthatjoelshinness) • [Github](https://github.com/JoelCodes) • [Buy me a coffee!](https://ko-fi.com/yesthatjoelshinness)

## Usage

`deferOf<T>(factory:() => T)`

* Parameters
  * `factory`: `() => T` Creates a value on subscription.
* Returns
  * [`Observable<T>`](https://rxjs.dev/api/index/class/Observable)

## Examples

```ts
let someValue = 1;

const deferredOfSomeValue = deferOf(() => someValue);

const observer:Observer<number> = {
  next(val){ console.log('Next', val); },
  complete(){ console.log('Complete'); },
  error(err){ console.log('Error', err); }
}

deferredOfSomeValue.subscribe(observer);

// OUTPUT:
// Next 1
// Complete

someValue = 3

deferredOfSomeValue.subscribe(observer);

// OUTPUT:
// Next 3
// Complete
```
