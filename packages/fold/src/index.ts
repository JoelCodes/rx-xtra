import {EmptyError, type MonoTypeOperatorFunction, Observable} from 'rxjs';

export function fold<T>(reducer: (acc: T, value: T) => T): MonoTypeOperatorFunction<T> {
  return source => new Observable<T>(destination => {
    let current: T | undefined;
    const observer = {
      next(value: T) {
        current = value;
        destination.next(value);
        observer.next = (value: T) => {
          current = reducer(current!, value);
          destination.next(current);
        };

        observer.complete = () => {
          destination.complete();
        };
      },
      complete() {
        destination.error(new EmptyError());
      },
      error(err: any) {
        destination.error(err);
      },
    };
    return source.subscribe(observer);
  });
}
