import {EMPTY, Observable, type ObservableInput, type RepeatConfig, type Subscription, concat, from, ignoreElements, take, timer, of} from 'rxjs';

export type LoopScanConfig = RepeatConfig & {
  startWithSeed?: boolean;
}

/**
 * Creates an Observable that from a repeated factory function, passing the last emitted value to the next iteration.
 * 
 * This allows you to define your apps in chains of `<T>(state:T) => ObservableInput<T>` functions, then chain them together.
 * 
 * @example
 * ```ts
 * loopScan((n: number, index:number) =>{
 *   console.log('Repeating', n, index);
 *   return [n, n + index];
 * }, 1, 3).subscribe(console.log);
 * 
 * // Output:
 * // Repeating 0 0
 * // 0
 * // 0
 * // Repeating 0 1
 * // 0
 * // 1
 * // Repeating 1 2
 * // 1
 * // 3
 * ```
 * 
 * This also allows tail-recursive style iteration.
 * 
 * @example
 * ```ts
 * function fibIterative(n:number):number{
 *   let a = 0, b = 1;
 *   for(; n > 0; --n){
 *     [a, b] = [b, a + b];
 *   }
 *   return a;
 * }
 * 
 * function fibTailRecursive(n:number, a = 0, b = 1):number{
 *   if(n <= 0) return a;
 *   return fibTailRecursive(n - 1, b, a + b);
 * }
 * 
 * function fibLoopScan(n:number):Observable<number>{
 *   return loopScan(
 *     ([a, b, n]) => of([b, a + b, n - 1]),
 *     [0, 1, n],
 *   ).pipe(
 *     startWith([0, 1, n]),
 *     takeWhile(([a, b, n]) => n > 0, true),
 *     map(([a, b, remaining]) => a),
 *   );
 * }
 * ```
 * 
 * @param factory Function that takes a state and returns an ObservableInput<T>.  The state is the last emitted value from the previous iteration, or the seed value for the first iteration.
 * @param seed Initial value for the first iteration.  This value is not emitted.
 * @param countOrConfig number of iterations to run the loop, or a RepeatConfig object with a count property and possible a delay.  If not provided, the loop will run until error or unsubscribe.
 * @returns Observable of state values
 */
export function loopScan<T>(
  factory: (state: T, index: number) => ObservableInput<T>, 
  seed: T, 
  countOrConfig?: number | LoopScanConfig): Observable<T> {

  let count = Infinity;
  let delay: RepeatConfig['delay'];
  let startWithSeed = false;
  if (typeof countOrConfig === 'number') {
    count = countOrConfig;
  } else if (typeof countOrConfig === 'object') {
    count = countOrConfig.count ?? Infinity;
    delay = countOrConfig.delay;
    startWithSeed = countOrConfig.startWithSeed ?? false;
  }

  if (count <= 0) {
    return startWithSeed ? of(seed) : EMPTY;
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
          const nextObs = from(factory(current, index));
          const nextWithDelay = typeof delay === 'number' && delay > 0
            ? concat(timer(delay).pipe(ignoreElements()), nextObs)
            : typeof delay === 'function'
              ? concat(from(delay(index)).pipe(take(1), ignoreElements()), nextObs)
              : nextObs;
          subscription = nextWithDelay.subscribe(observer);
        }
      },
    };
    if(startWithSeed) {
      destination.next(seed);
    }
    subscription = from(factory(seed, 0)).subscribe(observer);
    return () => {
      subscription?.unsubscribe();
    };
  });
}
