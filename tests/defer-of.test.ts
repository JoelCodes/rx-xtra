import { deferOf } from '../packages/defer-of';

describe('deferOf', () => {
  it('creates an observable that emits the value returned by the factory', () => {
    const factory = jest.fn(() => 1);
    const obs = deferOf(factory);
    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };
    expect(factory).not.toHaveBeenCalled();
    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.complete).not.toHaveBeenCalled();
    obs.subscribe(observer);
    expect(factory).toHaveBeenCalled();
    expect(observer.next).toHaveBeenCalledWith(1);
    expect(observer.next).toHaveBeenCalledTimes(1);
    expect(observer.complete).toHaveBeenCalled();
    expect(observer.error).not.toHaveBeenCalled();
  });
  it('calls the error if the factory throws', () => {
    const factory = jest.fn(() => {
      throw new Error('Boo');
    });
    const obs = deferOf(factory);
    const observer = {
      next: jest.fn(),
      error: jest.fn(),
      complete: jest.fn(),
    };
    expect(factory).not.toHaveBeenCalled();
    expect(observer.error).not.toHaveBeenCalled();
    obs.subscribe(observer);
    expect(factory).toHaveBeenCalled();
    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.complete).not.toHaveBeenCalled();
    expect(observer.error).toHaveBeenCalledWith(new Error('Boo'));
    expect(observer.error).toHaveBeenCalledTimes(1);
  });
});