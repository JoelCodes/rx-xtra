import { deferAbort } from '../packages/defer-abort/dist';
import { Subject } from 'rxjs';
describe('deferAbort', () => {
  it('creates an observable that calls a factory function on subscription, passing an abortsignal', () => {
    const factory = jest.fn((_signal) => [1,2,3]);
    const obs = deferAbort(factory);
    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn()
    }
    expect(factory).not.toHaveBeenCalled();
    obs.subscribe(observer);
    expect(factory).toHaveBeenCalled();
    expect(factory.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    expect(observer.next.mock.calls).toEqual([[1],[2],[3]]);
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalled();
  });
  it('triggers the abort on completion of the inner source', () => {
    const subj = new Subject<number>();
    let signal:AbortSignal|undefined;
    const factory = jest.fn((_signal) => {
      signal = _signal;
      return subj;
    });
    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn()
    }
    const onAbort = jest.fn();
    deferAbort(factory).subscribe(observer);

    signal!.addEventListener('abort', onAbort);

    expect(onAbort).not.toHaveBeenCalled();
    expect(signal!.aborted).toBe(false);
    expect(observer.complete).not.toHaveBeenCalled();

    subj.complete();

    expect(onAbort).toHaveBeenCalled();
    expect(signal!.aborted).toBe(true);
    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalled();
  });
  it('triggers the abort on error of the inner source', () => {
    const subj = new Subject<number>();
    let signal:AbortSignal|undefined;
    const factory = jest.fn((_signal) => {
      signal = _signal;
      return subj;
    });
    const onAbort = jest.fn();
    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn()
    };
    deferAbort(factory).subscribe(observer);

    signal!.addEventListener('abort', onAbort);
    expect(signal!.aborted).toBe(false);
    expect(onAbort).not.toHaveBeenCalled();
    expect(observer.error).not.toHaveBeenCalled();

    subj.error('Boo');
    expect(signal!.aborted).toBe(true);
    expect(onAbort).toHaveBeenCalled();
    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.error).toHaveBeenCalledWith('Boo');
    expect(observer.complete).not.toHaveBeenCalled();
  });
  it('triggers the abort on unsubscribe', () => {
    const subj = new Subject<number>();
    let signal:AbortSignal|undefined;
    const factory = jest.fn((_signal) => {
      signal = _signal;
      return subj;
    });
    const onAbort = jest.fn();
    const sub = deferAbort(factory).subscribe();

    signal!.addEventListener('abort',onAbort);
    expect(signal!.aborted).toBe(false);
    expect(onAbort).not.toHaveBeenCalled();
    sub.unsubscribe();
    expect(signal!.aborted).toBe(true);
    expect(onAbort).toHaveBeenCalled();
  });
});

