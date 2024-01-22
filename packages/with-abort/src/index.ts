import {EMPTY, type MonoTypeOperatorFunction, Observable} from 'rxjs';

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
