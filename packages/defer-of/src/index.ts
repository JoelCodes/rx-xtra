import {Observable} from 'rxjs';

/**
 * Version of RxJS `defer` that creates just one value (like `of`) on subscription
 *
 * @example
 * ```ts
 * const currentTime = deferOf(() => new Date());
 * ```
 *
 * @param factory A function that creates a single value on subscription.  If the factory throws an error, the new Observable errors out.
 * @returns An Observable that calls the factory function on subscription, emits the result and quits.
 */
export function deferOf<T>(factory: () => T): Observable<T> {
  return new Observable<T>(destination => {
    try {
      destination.next(factory());
      destination.complete();  
    } catch(e){
      destination.error(e);
    }
  });
}
