import { Observable, ObservableInput, from } from "rxjs"

export function deferAbort<T>(factory:(signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>(destination => {
    const controller = new AbortController();
    return from(factory(controller.signal))
      .subscribe(destination)
      .add(() => { controller.abort(); });
  });
}
