/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable max-nested-callbacks */
import {testScheduler} from './utils';
import {safeMap} from '../packages/safe-map';
import {Subject} from 'rxjs';

describe('safeMap', () => {
  it('maps the values of an observable', () => {
    testScheduler.run(({expectObservable, cold}) => {
      const obs = cold('012|', [1, 2, 3] as Record<number, number>);
      const mapped = obs.pipe(safeMap(n => n + 1));
      expectObservable(mapped).toBe('012|', [2, 3, 4]);
    });
  });
  it('handles errors', () => {
    testScheduler.run(({expectObservable, cold}) => {
      const obs = cold('0#', {0: 1}, 'Boo');
      const mapped = obs.pipe(safeMap(n => n + 1));
      expectObservable(mapped).toBe('0#', [2], 'Boo');
    });
  });
  describe('On Validation Error', () => {
    it('ignores the signal if there is no `onError`', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const obs = cold('01|', {0: 1, 1: 2}, 'Boo');
        const mapped = obs.pipe(safeMap(n => {
          if (n === 2) {
            throw new Error('Boo');
          }

          return n + 1;
        }));
        expectObservable(mapped).toBe('0-|', [2]);
      });
    });
    it('calls the `onError` if there is one', () => {
      // This test doesn't use testScheduler because it doesn't detect when a jest mock is called.
      const onError = jest.fn();
      const obs = new Subject<number>();
      const mapped = obs.pipe(safeMap(n => {
        if (n === 1) {
          throw new Error('Boo');
        }

        return n + 1;
      }, onError));
      const observer = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
      };
      mapped.subscribe(observer);
      expect(onError).not.toHaveBeenCalled();
      obs.next(1);
      expect(onError).toHaveBeenCalledWith(new Error('Boo'));
      expect(observer.next).not.toHaveBeenCalled();

      onError.mockClear();
      obs.next(2);
      expect(onError).not.toHaveBeenCalled();
      expect(observer.next).toHaveBeenCalledWith(3);
    });
    it('errors out the Observable if the onError throws an error', () => {
      testScheduler.run(({cold, expectObservable}) => {
        const onError = jest.fn(error => {
          throw error;
        });
        const project = () => {
          throw new Error('Boo');
        };

        expectObservable(cold('0').pipe(safeMap(project, onError)))
          .toBe('#', {}, new Error('Boo'));
      });
    });
  });
});
