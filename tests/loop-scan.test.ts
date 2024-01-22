/* eslint-disable max-nested-callbacks */
import {loopScan} from '../packages/loop-scan/';
import {testScheduler} from './utils';

describe('loopScan', () => {
  describe('factory', () => {
    it('calls the factory function on subscription with a seed value', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('n', {n: n + 1}));
        const loop$ = loopScan(factory, 0);
        expectObservable(loop$).toBe('0', [1]);
      });
    });
    it('calls the factory function with last emitted value when the inner observable completes', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('ab', {a: n, b: n + 1}))
          .mockImplementationOnce((n: number) => cold('ab|', {a: n, b: n + 1}));
        const loop$ = loopScan(factory, 0);
        expectObservable(loop$).toBe('0112', [0, 1, 2]);
      });
    });
    it('errors out when the inner observable errors', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('a#', {a: n + 1}, 'Boo'))
          .mockImplementationOnce((n: number) => cold('a|', {a: n + 1}, 'Boo'));
        expectObservable(loopScan(factory, 0)).toBe('01#', [1, 2], 'Boo');
      });
    });
  });
  describe('count', () => {
    it('behaves like EMPTY if the number is 0', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = (n: number) => cold('n', {n});
        const loop$ = loopScan(factory, 0, 0);
        expectObservable(loop$).toBe('|');
      });
    });
    it('completes if the loop commpletes `count` iterations', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('n|', {n: n + 1}));
        const loop$ = loopScan(factory, 0, 3);
        expectObservable(loop$).toBe('012|', [1, 2, 3]);
      });
    });
    it('uses the count from the config object', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('n|', {n: n + 1}));
        const loop$ = loopScan(factory, 0, {count: 3});
        expectObservable(loop$).toBe('012|', [1, 2, 3]);
      });
    });
  });
  describe('delay', () => {
    it('delays the start of the next iteration by the specified number of ms', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('n', {n: n + 1}))
          .mockImplementationOnce((n: number) => cold('n|', {n: n + 1}));
        const loop$ = loopScan(factory, 0, {delay: 100});
        expectObservable(loop$).toBe('0 100ms 1', [1, 2]);
      });
    });
    it('delays the start of the next iteration until the delay observable completes', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('n', {n: n + 1}))
          .mockImplementationOnce((n: number) => cold('n|', {n: n + 1}))
          .mockImplementationOnce((n: number) => cold('n|', {n: n + 1}));
        const delay = jest.fn(() => cold('200ms |'))
          .mockImplementationOnce(() => cold('100ms |'));

        const loop$ = loopScan(factory, 0, {delay});
        expectObservable(loop$).toBe('0 100ms 1 200ms 2', [1, 2, 3]);
      });
    });
    it('delays the start of the next iteration until the delay observable emits', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('n', {n: n + 1}))
          .mockImplementationOnce((n: number) => cold('n|', {n: n + 1}))
          .mockImplementationOnce((n: number) => cold('n|', {n: n + 1}));
        const delay = jest.fn(() => cold('200ms a'))
          .mockImplementationOnce(() => cold('100ms a'));

        const loop$ = loopScan(factory, 0, {delay});
        expectObservable(loop$).toBe('0 100ms 1 200ms 2', [1, 2, 3]);
      });
    });
    it('errors out the observable if the delay observable errors', () => {
      testScheduler.run(({expectObservable, cold}) => {
        const factory = jest.fn((n: number) => cold('n', {n: n + 1}))
          .mockImplementationOnce((n: number) => cold('n|', {n: n + 1}));
        const delay = jest.fn(() => cold('200ms #', {}, 'Boo'));
        const loop$ = loopScan(factory, 0, {delay});
        expectObservable(loop$).toBe('0 200ms #', [1], 'Boo');
      });
    });
  });
});
