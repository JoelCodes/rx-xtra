import {fold} from '../packages/fold';
import {testScheduler} from './utils';
import {EMPTY, EmptyError} from 'rxjs';

describe('Fold', () => {
  it('takes an empty observable and throws an empty error', () => {
    testScheduler.run(({expectObservable}) => {
      const obs = fold((acc: number, value: number) => acc + value)(EMPTY);
      expectObservable(obs).toBe('#', undefined, new EmptyError());
    });
  });
  it('takes an observable of one value and returns that value', () => {
    testScheduler.run(({expectObservable, cold}) => {
      const obs = fold((acc: number, value: number) => acc + value)(cold('0|', [1] as {[k in number]: number}));
      expectObservable(obs).toBe('0|', [1]);
    });
  });
  it('takes an observable of multiple values and returns an aggregate of the values', () => {
    testScheduler.run(({expectObservable, cold}) => {
      const obs = fold((acc: number, value: number) => acc + value)(cold<number>('012|', [1, 2, 3] as {[k in number]: number}));
      expectObservable(obs).toBe('012|', [1, 3, 6]);
    });
  });
  it('takes an erroring observable and throws the error', () => {
    testScheduler.run(({expectObservable, cold}) => {
      const obs = fold((acc: number, value: number) => acc + value)(cold('0#', [1] as {[k in number]: number}, 'Boo'));
      expectObservable(obs).toBe('0#', [1], 'Boo');
    });
  });
  it('calls the reducer with an increasing index', () => {
    testScheduler.run(({expectObservable, cold}) => {
      const reducer = jest.fn((_acc: number, _value: number, index: number) => index);
      const obs = fold(reducer)(cold('012|', [5, 6, 7] as {[k in number]: number}));
      expectObservable(obs).toBe('012|', [5, 1, 2]);
    });
  });
});
