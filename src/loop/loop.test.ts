import { EMPTY, NEVER, ObservableInput, Subject, throwError } from "rxjs";
import { TestScheduler } from "rxjs/testing";
import { loop } from ".";

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe('loop', () => {
  describe('Basic', () => {
    it('requests observable from callback', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const loopCb = jest.fn(() => cold('ab'));
        const loop$ = loop(loopCb);
        expectObservable(loop$).toBe('ab');
      });
    });
    it('turns observableInput into observable', () => {
      testScheduler.run(({ expectObservable }) => {
        const loopCb = jest.fn().mockReturnValue(NEVER).mockReturnValueOnce([1]);
        const loop$ = loop(loopCb);
        expectObservable(loop$).toBe('-1', {'1': 1});
      });
    });
    it('finishes one observable and starts the next, updating the index', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const loopCb = jest.fn(n => cold('n', { n })).mockImplementationOnce(n => cold('n|', { n }));
        const loop$ = loop(loopCb);
        expectObservable(loop$).toBe('-01', { '0': 0, '1': 1 });
        expect(loopCb)
      });
    });
  });
  describe('Error', () => {
    it('errors if a source observable errors', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const loopCb = jest.fn(() => cold('a#', { a: 1, "#": "Boo" }));
        const loop$ = loop(loopCb);
        expectObservable(loop$).toBe('--a#', { a: 1, "#": "Boo" });
      });
    });
  });
});
