import {type RunHelpers, TestScheduler} from 'rxjs/testing';

export const testScheduler = {
  run(cb: (helpers: RunHelpers) => void) {
    new TestScheduler((actual: any, expected: any) => {
      expect(actual).toEqual(expected);
    }).run(cb);
  },
};
