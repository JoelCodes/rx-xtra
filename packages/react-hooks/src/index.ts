import {useRef, useEffect} from 'react';
import {Subject, BehaviorSubject, type Observable, Unsubscribable} from 'rxjs';

/**
 * Creates, Maintains, and Completes an of RxJS Subject Instance.
 * 
 * This is useful for creating a connection between different components, hooks, or subscriptions.
 * 
 * @returns An instance of Subject that is created on mount, completed on unmount, and persists throughout.
 */
export function useSubject<T>() {
  const subject = useRef<Subject<T>>();
  if (!subject.current) {
    subject.current = new Subject<T>();
  }

  useEffect(() => () => {
    subject.current?.complete();
  }, []);
  return subject.current;
}

/**
 * Creates, Maintains, and Completes an of RxJS BehaviorSubject Instance.
 * 
 * This is similar to useSubject, but it also maintains a value that is emitted to new subscribers.
 * This is useful for creating a connection between different components, hooks, or subscriptions.
 * 
 * @returns An instance of Subject that is created on mount, completed on unmount, and persists throughout.
 */
export function useBehaviorSubject<T>(initialVal: T) {
  const subject = useRef<BehaviorSubject<T>>();
  if (!subject.current) {
    subject.current = new BehaviorSubject<T>(initialVal);
  }

  useEffect(() => () => {
    subject.current?.complete();
  }, []);
  return subject.current;
}

/**
 * Takes series of dependencies and returns an Observable that emits a stream of those dependencies' current states.
 * 
 * @param deps A series of dependencies to observe.  There must be at least one dep
 * @returns Observable of the current state of the dependencies
 */
export function useObserve<Deps extends [any, ...any[]]>(deps: Deps) {
  const subject = useBehaviorSubject<Deps>(deps);
  const isFirst = useRef(true);
  const observableRef = useRef<Observable<Deps>>();
  if (!observableRef.current) {
    observableRef.current = subject.asObservable();
  }
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    subject.next(deps);
  }, deps);
  return observableRef.current;
}

/**
 * Like UseObserve, but only emits when the dependencies change.
 * 
 * @param deps  A series of dependencies to observe.  There must be at least one dep.
 * @returns An Observable of changes to the state of the dependencies.
 */
export function useObserveChanges<Deps extends [any, ...any[]]>(deps: Deps) {
  const subject = useSubject<Deps>();
  const observableRef = useRef<Observable<Deps>>();
  if (!observableRef.current) {
    observableRef.current = subject.asObservable();
  }
  useEffect(() => {
    subject.next(deps);
  }, deps);
  return observableRef.current;
}

/**
 * Takes a callback that returns an Unsubscribable and subscribes to it on mount.
 * 
 * This is useful for subscribing to Observables that are created in a hook.
 * 
 * @param cb Callback that returns an Unsubscribable
 * @param deps Dependencies to pass to the callback.  The callback will be called with these dependencies on mount and whenever they change.
 */
export function useSubscribe(cb: () => Unsubscribable, deps: any[] = []) {
  useEffect(() => {
    const subscription = cb();
    return () => {
      subscription.unsubscribe();
    };
  }, deps);
}
