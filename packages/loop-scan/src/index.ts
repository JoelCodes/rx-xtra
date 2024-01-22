import {EMPTY, Observable, type ObservableInput, type RepeatConfig, type Subscription, concat, from, ignoreElements, take, timer} from 'rxjs';

export function loopScan<T>(cb: (state: T, index: number) => ObservableInput<T>, seed: T, countOrConfig?: number | RepeatConfig): Observable<T> {
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
    let current = seed;
    let subscription: Subscription | undefined;
    const observer = {
      next(value: T) {
        destination.next(value);
        current = value;
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
          const nextObs = from(cb(current, index));
          const nextWithDelay = typeof delay === 'number' && delay > 0
            ? concat(timer(delay).pipe(ignoreElements()), nextObs)
            : typeof delay === 'function'
              ? concat(from(delay(index)).pipe(take(1), ignoreElements()), nextObs)
              : nextObs;
          subscription = nextWithDelay.subscribe(observer);
        }
      },
    };
    subscription = from(cb(seed, 0)).subscribe(observer);
    return () => {
      subscription?.unsubscribe();
    };
  });
}
