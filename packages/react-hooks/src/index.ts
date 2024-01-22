import { useRef, useEffect } from 'react';
import { Subject, BehaviorSubject, Subscription } from 'rxjs';

export function useSubject<T>(){
  const subject = useRef<Subject<T>>();
  if(!subject.current) subject.current = new Subject<T>();
  useEffect(() => {
    return () => {
      subject.current?.complete();
    }
  }, []);
  return subject.current;
}

export function useBehaviorSubject<T>(initialVal:T){
  const subject = useRef<BehaviorSubject<T>>();
  if(!subject.current) subject.current = new BehaviorSubject<T>(initialVal);
  useEffect(() => {
    return () => {
      subject.current?.complete();
    }
  }, []);
  return subject.current;
}

export function useObserve<TDeps extends any[]>(deps:TDeps) {
  const subject = useBehaviorSubject<TDeps>(deps);
  const isFirst = useRef(true);
  useEffect(() => {
    if(isFirst.current){
      isFirst.current = false;
      return;
    }
    subject.next(deps);
  }, deps);
  return subject;
}

export function useSubscribe(cb:() => Subscription, deps:any[] = []){
  useEffect(() => {
    const subscription = cb();
    return () => {
      subscription.unsubscribe();
    }
  }, deps);
}