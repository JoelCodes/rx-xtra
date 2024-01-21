import { useBehaviorSubject, useObserve, useSubject, useSubscribe } from '../packages/react-hooks';
import { renderHook } from '@testing-library/react';
import { Subject, BehaviorSubject, Subscription, TapObserver, NEVER } from 'rxjs';
import { tap } from 'rxjs/operators';
/**
 * @jest-environment jsdom
 */
describe('React Hooks', () => {
  describe('useSubject', () => {
    it('returns a Subject', () => {
      const {
        result
      } = renderHook(useSubject);
      expect(result.current).toBeInstanceOf(Subject);
    });
    it('returns the same Subject on subsequent calls', () => {
      const {
        result,
        rerender
      } = renderHook(useSubject);
      const subject = result.current;
      rerender();
      expect(result.current).toBe(subject);
    
    });
    it('completes the Subject on unmount', () => {
      const {
        result,
        unmount
      } = renderHook(useSubject);
      const subject = result.current;
      const complete = jest.fn();
      subject.subscribe({
        complete
      });
      expect(complete).not.toHaveBeenCalled();
      unmount();
      expect(complete).toHaveBeenCalled();
    });
  })
  describe('useBehaviorSubject', () => {
    it('returns a BehaviorSubject', () => {
      const {
        result
      } = renderHook(() => useBehaviorSubject(1));
      expect(result.current).toBeInstanceOf(BehaviorSubject);
      const next = jest.fn();
      result.current.subscribe(next);
      expect(next).toHaveBeenCalledWith(1);
      expect(result.current.value).toBe(1);
    });
    it('returns the same BehaviorSubject on subsequent calls', () => {
      const {
        result,
        rerender
      } = renderHook(() => useBehaviorSubject(1));
      const subject = result.current;
      rerender();
      expect(result.current).toBe(subject);
    });
    it('completes the BehaviorSubject on unmount', () => {
      const {
        result,
        unmount
      } = renderHook(() => useBehaviorSubject(1));
      const subject = result.current;
      const complete = jest.fn();
      subject.subscribe({
        complete
      });
      expect(complete).not.toHaveBeenCalled();
      unmount();
      expect(complete).toHaveBeenCalled();
    });
  });
  describe('useObserve', () => {
    it('returns a BehaviorSubject', () => {
      const {
        result
      } = renderHook(() => useObserve([1]));
      expect(result.current).toBeInstanceOf(BehaviorSubject);
      const next = jest.fn();
      result.current.subscribe(next);
      expect(next).toHaveBeenCalledWith([1]);
      expect(result.current.value).toEqual([1]);
    })
    it('returns the same BehaviorSubject on subsequent calls', () => {
      const {
        result,
        rerender
      } = renderHook(() => useObserve([1]));
      const subject = result.current;
      rerender();
      expect(result.current).toBe(subject);
    
    });
    it('completes the BehaviorSubject on unmount', () => {
      const {
        result,
        unmount
      } = renderHook(() => useObserve([1]));
      const subject = result.current;
      const complete = jest.fn();
      subject.subscribe({
        complete
      });
      expect(complete).not.toHaveBeenCalled();
      unmount();
      expect(complete).toHaveBeenCalled();
    
    });
    it('emits changes the BehaviorSubject when the deps change', () => {
      const {
        result,
        rerender
      } = renderHook((deps) => useObserve(deps), {
        initialProps: [1]
      });
      const subject = result.current;
      const next = jest.fn();
      subject.subscribe(next);
      expect(next).toHaveBeenCalledWith([1]);
      rerender([2]);
      expect(next).toHaveBeenCalledWith([2]);
      expect(result.current).toBe(subject);
    
    });
  });
  describe('useSubscribe', () => {
    it('subscribes to the observable returned from the callback', () => {
      const subscribe = jest.fn();
      renderHook(({cb}:{cb:() => Subscription}) => useSubscribe(cb), { 
        initialProps: {cb:() => NEVER.pipe(tap({ subscribe })).subscribe() }
      });
      expect(subscribe).toHaveBeenCalled();
    });
    it('does not resubscribe on rerender if deps has not changed', () => {
      const subscribe = jest.fn();
      const unsubscribe = jest.fn();
      const cb = () => NEVER.pipe(tap({ subscribe, unsubscribe })).subscribe();
      const { rerender } = renderHook(({cb, deps}:{cb:() => Subscription, deps: any[]}) => useSubscribe(cb, deps), { 
        initialProps: {cb, deps:[]}
      });
      rerender({cb, deps:[]});
      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(unsubscribe).not.toHaveBeenCalled();
    
    })
    it('unsubscribes from the observable on unmount', () => {
      const unsubscribe = jest.fn();
      const cb = () => NEVER.pipe(tap({ unsubscribe })).subscribe();
      const { unmount } = renderHook(({cb}:{cb:() => Subscription}) => useSubscribe(cb), { 
        initialProps: {cb}
      });
      expect(unsubscribe).not.toHaveBeenCalled();
      unmount();
      expect(unsubscribe).toHaveBeenCalled(); 
    });
    it('unsubscribes and resubscribes when the deps change', () => {
      const subscribe = jest.fn();
      const unsubscribe = jest.fn();
      const cb = () => NEVER.pipe(tap({ subscribe, unsubscribe })).subscribe();
      const { rerender, unmount } = renderHook(({cb, deps}:{cb:() => Subscription, deps: [number]}) => useSubscribe(cb, deps), { 
        initialProps: {cb, deps:[1]}
      });
      rerender({cb, deps:[1]});
      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(unsubscribe).not.toHaveBeenCalled();
      rerender({cb, deps:[2]});
      expect(subscribe).toHaveBeenCalledTimes(2);
      expect(unsubscribe).toHaveBeenCalledTimes(1);
      unmount();
      expect(unsubscribe).toHaveBeenCalledTimes(2);
    });
  });
})