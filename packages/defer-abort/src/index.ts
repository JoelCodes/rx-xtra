import {Observable, type ObservableInput, from} from 'rxjs';

/**
 * Version of RxJS `defer` that takes some existing function or API that uses an AbortSignal to clean up, and converts it to an observable that aborts when unsubscribed.
 *
 * Since it aligns with `defer`, it can accept a function that returns an [ObservableInput<T>](https://rxjs.dev/api/index/type-alias/ObservableInput), which includes Observables, arrays, promises, iterables, async iterables, and more.
 *
 * @example
 * ```ts
 * // Some example function that uses an AbortSignal to clean up
 * async function *countUpUntilAbort(signal:AbortSignal):AsyncGenerator<number>{
 *   let i = 0;
 *   while(!signal.aborted){
 *     yield i++;
 *     await new Promise(resolve => setTimeout(resolve, 100));
 *   }
 *   console.log('Function finished!');
 * }
 *
 * // convert `countUpUntilAbort` to an observable that aborts when unsubscribed
 * const obs = deferAbort(countUpUntilAbort);
 *
 * obs.pipe(take(3)).subscribe({
 *   next(value): { console.log('Next', value); },
 *   error(err): { console.error('Error', err); },
 *   complete(): { console.log('Complete'); }
 * });
 *
 * // Output:
 * // Next 0
 * // Next 1
 * // Next 2
 * // Complete
 * // Function finished!
 * ```
 *
 * @param factory A function that accepts an AbortSignal and returns an [ObservableInput<T>](https://rxjs.dev/api/index/type-alias/ObservableInput)
 * @returns An Observable that calls the factory function on subscription, passing an AbortSignal, and aborts the signal when the inner observable ends.
 */
export function deferAbort<T>(factory: (signal: AbortSignal) => ObservableInput<T>): Observable<T> {
  return new Observable<T>(destination => {
    const controller = new AbortController();
    from(factory(controller.signal))
      .subscribe(destination)
      .add(() => {
        controller.abort();
      });
  });
}
