import {EMPTY, Observable, type ObservableInput, type RepeatConfig, type Subscription, concat, from, ignoreElements, take, timer} from 'rxjs';

/**
 *
 *
 * @param factory Factory function that returns an ObservableInput<T> given an index.  The index starts at 0 and increments by 1 for each iteration.
 * @param countOrConfig number of iterations to run the loop, or a RepeatConfig object with a count property and possible a delay.  If not provided, the loop will run infinitely.
 * @returns
 */
export function loop<T>(factory: (index: number) => ObservableInput<T>, countOrConfig?: number | RepeatConfig): Observable<T> {
  let count = Infinity;
  let delay: RepeatConfig['delay'];
  if (typeof countOrConfig === 'number') {
    count = countOrConfig;
  } else if (typeof countOrConfig === 'object') {
    count = countOrConfig.count ?? Infinity;
    delay = countOrConfig.delay;
  }

  if (count <= 0) {
    return EMPTY;
  }

  return new Observable<T>(destination => {
    let index = 0;
    let subscription: Subscription | undefined;
    const observer = {
      next(value: T) {
        destination.next(value);
      },
      error(err: any) {
        destination.error(err);
      },
      complete() {
        subscription?.unsubscribe();
        ++index;
        if (index >= count) {
          destination.complete();
        } else {
          const nextObs = from(factory(index));
          const nextWithDelay = typeof delay === 'number' && delay > 0
            ? concat(timer(delay).pipe(ignoreElements()), nextObs)
            : typeof delay === 'function'
              ? concat(from(delay(index)).pipe(take(1), ignoreElements()), nextObs)
              : nextObs;
          subscription = nextWithDelay.subscribe(observer);
        }
      },
    };
    subscription = from(factory(0)).subscribe(observer);
    return () => {
      subscription?.unsubscribe();
    };
  });
}
