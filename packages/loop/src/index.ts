import { EMPTY, Observable, ObservableInput, RepeatConfig, Subscription, concat, from, ignoreElements, take, timer } from "rxjs"

export function loop<T>(cb:(index:number) => ObservableInput<T>, countOrConfig?: number | RepeatConfig):Observable<T>{
  let count = Infinity;
  let delay: RepeatConfig['delay'];
  if(typeof countOrConfig === 'number'){
    count = countOrConfig;
  } else if(typeof countOrConfig === 'object'){
    count = countOrConfig.count ?? Infinity;
    delay = countOrConfig.delay;
  }
  if(count <= 0) return EMPTY;

  return new Observable<T>(destination => {
    let index = 0;
    let subscription:Subscription|undefined;
    let observer = {
      next(value:T){
        destination.next(value);
      },
      error(err:any){
        destination.error(err);
      },
      complete(){
        subscription?.unsubscribe();
        ++index;
        if(index >= count) {
          destination.complete();
        } else {
          const nextObs = from(cb(index));
          const nextWithDelay = typeof delay === 'number' && delay > 0
            ? concat(timer(delay).pipe(ignoreElements()), nextObs)
            : typeof delay === 'function'
              ? concat(from(delay(index)).pipe(take(1), ignoreElements()), nextObs)
              : nextObs;
          subscription = nextWithDelay.subscribe(observer);
        }
      }
    }
    subscription = from(cb(0)).subscribe(observer);
    return () => {
      subscription?.unsubscribe();
    };
  });
}