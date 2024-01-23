import {EmptyError, type MonoTypeOperatorFunction, Observable} from 'rxjs';


export function fold<T>(reducer: (acc: T, value: T, index:number) => T): MonoTypeOperatorFunction<T> {
  return source => new Observable<T>(destination => {
    let current: T | undefined;
    let index = 0;
    const observer = {
      next(value: T) {
        current = value;
        destination.next(value);

        observer.next = (value: T) => {
          current = reducer(current!, value, ++index);
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
