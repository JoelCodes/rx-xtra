import { abortable } from '../packages/abortable';
import { Subject } from 'rxjs';
describe('abortable', () => {
  it('creates an observable that calls a factory function on subscription, passing an abortsignal', () => {
    const factory = jest.fn((_signal) => [1,2,3]);
    const obs = abortable(factory);
    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn()
    }
    expect(factory).not.toHaveBeenCalled();
    obs.subscribe(observer);
    expect(factory).toHaveBeenCalled();
    expect(factory.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    expect(observer.next).toHaveBeenCalledTimes(3);
    expect(observer.next).toHaveBeenNthCalledWith(1, 1);
    expect(observer.next).toHaveBeenNthCalledWith(2, 2);
    expect(observer.next).toHaveBeenNthCalledWith(3, 3);
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
    abortable(factory).subscribe();
    if(!signal) throw new Error('No signal');
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
    subj.complete();
    expect(signal.aborted).toBe(true);
  });
  it('triggers the abort on error of the inner source', () => {
    const subj = new Subject<number>();
    let signal:AbortSignal|undefined;
    const factory = jest.fn((_signal) => {
      signal = _signal;
      return subj;
    });
    abortable(factory).subscribe();
    if(!signal) throw new Error('No signal');
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
    subj.error('Boo');
    expect(signal.aborted).toBe(true);
  });
  it('triggers the abort on unsubscribe', () => {
    const subj = new Subject<number>();
    let signal:AbortSignal|undefined;
    const factory = jest.fn((_signal) => {
      signal = _signal;
      return subj;
    });
    const sub = abortable(factory).subscribe();
    if(!signal) throw new Error('No signal');
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
    sub.unsubscribe();
    expect(signal.aborted).toBe(true);
  });
});

