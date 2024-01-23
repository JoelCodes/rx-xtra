# Rx Xtra

More Utility Operators for [RxJS](https://rxjs.dev/)

## About the Library

I love RxJS, but there are a few operators that I often reach for that aren't part of the core library.  In other libraries, I'd be pestering the maintainers to add them, but this is RxJS!  There's no need to change the library, when we can just create functions, and if they're just functions, they can be released in their own packages!

This repo encapsulates a number of utilities released as their own npm packages, á la Lodash.

### Creation Operators

* [loop](./packages/loop/) [![rx-xtra.loop on NPM](https://avatars.githubusercontent.com/u/6078720?s=16&v=4)](https://www.npmjs.com/package/rx-xtra.loop)
* [loopScan](./packages/loop-scan/) [![rx-xtra.loop-scan on NPM](https://avatars.githubusercontent.com/u/6078720?s=16&v=4)](https://www.npmjs.com/package/rx-xtra.loop-scan)
* [deferAbort](./packages/defer-abort/) [![rx-xtra.defer-abort on NPM](https://avatars.githubusercontent.com/u/6078720?s=16&v=4)](https://www.npmjs.com/package/rx-xtra.defer-abort)
* [deferOf](./packages/defer-of) -- Coming Soon!

### Pipeable Operators

* [fold](./packages/defer-abort/) -- Coming Soon!
* [safeMap](./packages/safe-map/) [![rx-xtra.fold on NPM](https://avatars.githubusercontent.com/u/6078720?s=16&v=4)](https://www.npmjs.com/package/rx-xtra.safe-map)
* [withAbort](./packages/with-abort/) [![rx-xtra.fold on NPM](https://avatars.githubusercontent.com/u/6078720?s=16&v=4)](https://www.npmjs.com/package/rx-xtra.with-abort)

### React Utilities

* [react-hooks](./packages/react-hooks/) A collection of React Hooks that help sync Observables with React component lifecycles
  * `useSubscribe` - Syncs an RxJS Subscription lifetime to React lifecycles.
  * `useObserve` - Creates a stateful Observable that watches React states and props.
  * `useObserveChanges` - Creats an Observable of changes to React states and props.
  * `useSubject` - A Subject that is created on mount on completed on unmount
  * `useBehaviorSubject`- A BehaviorSubject (i.e. a stateful Subject) that is created on mount and completed on unmount

## Contributing

Got a suggestion for a new feature, feedback on an existing one, or other ways to improve this codebase?  Please feel free to add an issue!

Want to show your appreciation? [Buy me a coffee!](https://ko-fi.com/yesthatjoelshinness)
