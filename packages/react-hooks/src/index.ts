import {useRef, useEffect} from 'react';
import {Subject, BehaviorSubject, type Subscription, type Observable} from 'rxjs';

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

export function useObserve<Deps extends any[]>(deps: Deps) {
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

export function useSubscribe(cb: () => Subscription, deps: any[] = []) {
  useEffect(() => {
    const subscription = cb();
    return () => {
      subscription.unsubscribe();
    };
  }, deps);
}
