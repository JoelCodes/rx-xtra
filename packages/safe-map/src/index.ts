import {Observable, type OperatorFunction} from 'rxjs';

export function safeMap<A, B>(project: (value: A, index: number) => B, onError?: (err: any) => void): OperatorFunction<A, B> {
  return source => new Observable<B>(destination => {
    let index = 0;
    const observer = {
      next(value: A) {
        try {
          destination.next(project(value, index++));
        } catch (err) {
          try {
            if (onError) {
              onError(err);
            }
          } catch (err) {
            destination.error(err);
          }
        }
      },
      complete() {
        destination.complete();
      },
      error(err: any) {
        destination.error(err);
      },
    };
    return source.subscribe(observer);
  });
}
