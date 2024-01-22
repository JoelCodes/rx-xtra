import {testScheduler} from './utils';
import {withAbort} from '../packages/with-abort';
import {Subject} from 'rxjs';

describe('withAbort', () => {
  describe('Responding to AbortSignal', () => {
    it('acts like empty if the signal is already aborted', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const controller = new AbortController();
        controller.abort();
        const obs = cold('-').pipe(withAbort(controller.signal));
        expectObservable(obs).toBe('|');
      });
    });
    it('acts like empty if the signal aborts before subscription', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const controller = new AbortController();
        const obs = cold('-').pipe(withAbort(controller.signal));
        controller.abort();
        expectObservable(obs).toBe('|');
      });
    });
    it('completes if the signal aborts after subscription', () => {
      const subj = new Subject<number>();
      const controller = new AbortController();
      const obs = subj.pipe(withAbort(controller.signal));
      const observer = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
      };
      const addEventListener = jest.spyOn(controller.signal, 'addEventListener');
      expect(addEventListener).not.toHaveBeenCalled();
      obs.subscribe(observer);
      expect(addEventListener).toHaveBeenCalled();

      const removeEventListener = jest.spyOn(controller.signal, 'removeEventListener');
      expect(removeEventListener).not.toHaveBeenCalled();
      expect(observer.complete).not.toHaveBeenCalled();
      controller.abort();

      expect(observer.complete).toHaveBeenCalled();
      expect(removeEventListener).toHaveBeenCalledWith(...addEventListener.mock.calls[0]);
    });
  });
  describe('Responding to Source Observable', () => {
    it('emits values from the source', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const obs = cold('012|', [1, 2, 3] as Record<number, number>).pipe(withAbort(new AbortController().signal));
        expectObservable(obs).toBe('012|', [1, 2, 3]);
      });
    });
    it('completes if the source completes, removing the abort listener', () => {
      const subj = new Subject<number>();
      const controller = new AbortController();
      const addEventListener = jest.spyOn(controller.signal, 'addEventListener');
      const removeEventListener = jest.spyOn(controller.signal, 'removeEventListener');
      const observer = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
      };
      subj.pipe(withAbort(controller.signal)).subscribe(observer);
      expect(addEventListener).toHaveBeenCalled();
      expect(removeEventListener).not.toHaveBeenCalled();
      expect(observer.complete).not.toHaveBeenCalled();
      subj.complete();
      expect(observer.complete).toHaveBeenCalled();
      expect(removeEventListener).toHaveBeenCalledWith(...addEventListener.mock.calls[0]);
      expect(observer.next).not.toHaveBeenCalled();
    });
    it('errors if the source errors, removing the abort listener', () => {
      const subj = new Subject<number>();
      const controller = new AbortController();
      const addEventListener = jest.spyOn(controller.signal, 'addEventListener');
      const removeEventListener = jest.spyOn(controller.signal, 'removeEventListener');
      const observer = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
      };
      subj.pipe(withAbort(controller.signal)).subscribe(observer);
      expect(addEventListener).toHaveBeenCalled();
      expect(removeEventListener).not.toHaveBeenCalled();
      expect(observer.complete).not.toHaveBeenCalled();
      subj.error('Boo');
      expect(observer.error).toHaveBeenCalledWith('Boo');
      expect(removeEventListener).toHaveBeenCalledWith(...addEventListener.mock.calls[0]);
      expect(observer.next).not.toHaveBeenCalled();
    });
  });
});
