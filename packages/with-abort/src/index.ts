import {EMPTY, type MonoTypeOperatorFunction, Observable} from 'rxjs';

/**
 * Operator to complete an Observable when an AbortSignal is aborted.
 * 
 * This is great for using Observables in a context that uses the AbortController API.
 * 
 * @param signal AbortSignal to end the stream
 * @returns OperatorFunction that will complete the stream when the AbortSignal is aborted
 */
export function withAbort<T>(signal: AbortSignal): MonoTypeOperatorFunction<T> {
  return source => {
    if (signal.aborted) {
      return EMPTY;
    }

    return new Observable<T>(destination => {
      if (signal.aborted) {
        destination.complete();
        return;
      }

      function onAbort() {
        destination.complete();
      }

      signal.addEventListener('abort', onAbort);
      source.subscribe(destination)
        .add(() => {
          signal.removeEventListener('abort', onAbort);
        });
    });
  };
}
