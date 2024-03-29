# Rx Xtra: With Abort

`withAbort` lets an RxJS [Observable](https://rxjs.dev/api/index/class/Observable) be controlled by an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).  This is great for using Observables within a context that relies on the [AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

Imagine the following marble diagram for an Observable, with time going from left to right.

![Source Observable Marble Diagram](../../diagrams/with-abort/timeline1.excalidraw.png)

And imagine that we have an AbortSignal that we want to end that subscription.  Its `aborted` state is initially `false`, but then an `abort` event eventually happens, changing its state to true.

![Source Observable and Signal Diagram](../../diagrams/with-abort/timeline2.excalidraw.png)

We can use `withAbort` to create a new Observable that subscribes to the source, and unsubscribes when the signal switches.

![Derived Observable](../../diagrams/with-abort/timeline3.excalidraw.png)

Want to go the other way, turning a function that uses the AbortController into an Observable?  Check out [`rx-xtra.defer-abort`](https://www.npmjs.com/package/rx-xtra.defer-abort)!

`rx-xtra.with-abort` is part of [`Rx Xtra`](https://github.com/JoelCodes/rx-xtra), a collection of [RxJS](https://rxjs.dev/) utilities.

Created by Joel Shinness [LinkTree](https://linktr.ee/yesthatjoelshinness) • [Github](https://github.com/JoelCodes) • [Buy me a coffee!](https://ko-fi.com/yesthatjoelshinness)

## Usage

`withAbort<T>(signal:AbortSignal):MonoTypeOperatorFunction<T>`

* Parameters
  * `signal`: [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
* Returns
  * [`MonoTypeOperatorFunction<T>`](https://rxjs.dev/api/index/interface/MonoTypeOperatorFunction) An operator that takes a source Observable and returns a created Observable.  The created observable will behave exactly like its source, except that it will complete when the signal aborts.  If the signal has already aborted by the time the subscription happens, the created observable will behave like [EMPTY](https://rxjs.dev/api/index/const/EMPTY) and complete immediately on subscription without emitting any values.

## Example

```ts
// From some library somewhere...
function someAbortableApi(cb:(next:(val:number) => void, signal:AbortSignal) => void){}

// In your app code...
const myObservable:Observable<number> = /* Some Observable */

someAbortableApi((next, signal) => {
  myObservable.pipe(
    withAbort(signal)
  ).subscribe(next);
});
```
