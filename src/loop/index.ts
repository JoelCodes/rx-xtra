import { Observable, ObservableInput, Subscription, from } from "rxjs"

export function loop<T>(cb:(index:number) => ObservableInput<T>):Observable<T>{
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
        subscription = from(cb(++index)).subscribe(observer);
      }
    }
    subscription = from(cb(0)).subscribe(observer);
    return () => {
      subscription?.unsubscribe();
    };
  });
}