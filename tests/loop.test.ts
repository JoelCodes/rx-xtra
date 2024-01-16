import { NEVER, ObservableInput, Observer } from "rxjs";
import { TestScheduler } from "rxjs/testing";
import { loop } from "../packages/loop/src";

const testScheduler = () => new TestScheduler((actual:any, expected:any) => {
  expect(actual).toEqual(expected);
});

describe('loop', () => {
  describe('Basic', () => {
    it('requests observable from callback', () => {
      testScheduler().run(({ expectObservable, cold }) => {
        const loopCb = jest.fn(() => cold('ab'));
        const loop$ = loop(loopCb);
        expectObservable(loop$).toBe('ab');
      });
    });
    it('turns observableInput into observable', () => {
      testScheduler().run(({ expectObservable }) => {
        const loopCb = jest.fn<ObservableInput<number>, []>(() => NEVER).mockReturnValueOnce([1]);
        const loop$ = loop(loopCb);
        expectObservable(loop$).toBe('1', {'1': 1});
      });
    });
    it('finishes one observable and starts the next, updating the index', () => {
      testScheduler().run(({ expectObservable, cold }) => {
        const loopCb = jest.fn(n => cold('n', { n })).mockImplementationOnce(n => cold('n|', { n }));
        const loop$ = loop(loopCb);
        expectObservable(loop$).toBe('01', { '0': 0, '1': 1 });
        expect(loopCb)
      });
    });
  });
  describe('Repeat Configs', () => {
    describe('number', () => {
      it('repeats the observable the specified number of times', () => {
        testScheduler().run(({ expectObservable,cold }) => {
          const loopCb = jest.fn(n => cold('n|', { n }));
          const loop$ = loop(loopCb, 3);
          expectObservable(loop$).toBe('012|', { '0': 0, '1': 1, '2': 2 });
        });
      });
      it('behaves like EMPTY if the number is 0', () => {
        testScheduler().run(({ expectObservable, cold }) => {
          const loopCb = jest.fn(() => cold('-'));
          const loop$ = loop(loopCb, 0);
          expectObservable(loop$).toBe('|');
        });
      });
    });
    describe('object', () => {
      describe('count', () => {
        it('repeats the observable the specified number of times', () => {
          testScheduler().run(({ expectObservable,cold }) => {
            const loopCb = jest.fn(n => cold('n|', { n }));
            const loop$ = loop(loopCb, { count: 3 });
            expectObservable(loop$).toBe('012|', { '0': 0, '1': 1, '2': 2 });
          });
        });
        it('behaves like EMPTY if the number is 0', () => {
          testScheduler().run(({ expectObservable, cold }) => {
            const loopCb = () => cold('-')
            const loop$ = loop(loopCb, { count: 0 });
            expectObservable(loop$).toBe('|');
          });
        });
      });
    });
  });
  describe('Error', () => {
    it('errors if a source observable errors', () => {
      testScheduler().run(({ expectObservable, cold }) => {
        const loopCb = jest.fn(() => cold('a#', { a: 1}, "Boo"));
        const loop$ = loop(loopCb);
        expectObservable(loop$).toBe('a#', { a: 1}, "Boo");
      });
    });
  });
});
