# Rx Xtra: React Hooks

These hooks RxJS and React play nice with each other, synchronizing Observables and Subscriptions with React's component and state lifecycles.  If you've ever wanted to use a little helping of RxJS in your React, this is a good start.

`rx-xtra.react-hooks` is part of [`Rx Xtra`](https://github.com/JoelCodes/rx-xtra), a collection of [RxJS](https://rxjs.dev/) utilities.

Created by Joel Shinness [LinkTree](https://linktr.ee/yesthatjoelshinness) • [Github](https://github.com/JoelCodes) • [Buy me a coffee!](https://ko-fi.com/yesthatjoelshinness)

## Usage

### `useSubscribe`

Manages a subscription over the lifecycle of a hook or component, optionally responding to updating state as well.

```ts
function useMyHook(positions:Observable<number>){
  // Take series of positions and console.log the velocity and acceleration
  useSubscribe(() => positions.pipe(
    scan(([pos, vel, acc], newPos) => {
      const newVel = newPos - pos;
      const newAcc = newVel - vel;
      return [newPos, newVel, newAcc];
    }, [0, 0, 0]).
    ).subscribe(([pos, vel, acc]) => { 
      console.log('Current', pos, vel, acc) 
    }).add(() => { 
      console.log('Good place for any other teardown logic!');
    })
  );
}
```

There is also a "deps" array that defaults to `[]`.  If you pass in states or props as dependencies, and the dependencies change, the existing subscription will end and a new one will be created (kinda like [`switchMap`](https://rxjs.dev/api/index/function/switchMap)).

### `useObserve<Deps extends any[]>`

This takes any number of states or props and creates a "stateful" Observable from them.  By "stateful" that means that, whenever this Observable gets a subscription, the first thing it emits is the current (or last) value.

```ts
function useMyHook(){
  const [name] = useState('Joel');
  const name$ = useObserve([name]);

  useSubscribe(() => {
    const subscription = new Subscription();
    // Subscribe to name$ immediately
    subscription.add(name$.subscribe(([name]) => {
      console.log('Name is', name)
    }));

    // Wait a bit, then subscribe to name$
    subscription.add(concat(
      timer(1000).pipe(
        ignoreElements(), 
        tap({
          subscribe(): { console.log('Starting to wait'); }
          finalize(): { console.log('Done waiting'); }
        })
      ),
      name$.pipe(
        tap({
          subscribe(): { console.log('Now listening to name$')}
        })
      )
    ).subscribe(([name]) => {
      console.log('Now, the name is', name)
    }));

    // Trigger a change eventually
    subscription.add(timer(2000).subscribe(() => { setName('Jeff'); }));

    return subscription;
  });

}

// OUTPUT:
// Name is Joel
// Starting to wait
// .... 1000 ms elapses
// Done waiting
// Now listening to name$
// Now, the name is Joel
// Name is Jeff
// Now, the name is Jeff
```

### `useObserveChanges`

This is the "stateless" version of `useObserve`, which just means that it doesn't emit the current value immediately on subscription.

```ts
function useMyHook(){
  const [name, setName] = useState('Joel');
  const name$ = useObserveChanges([name]);

  useSubscribe(() => {
    const subscription = new Subscription();
    
    // Subscribe to name$ immediately
    subscription.add(name$.subscribe(([name]) => {
      console.log('Name is', name)
    }));

    // Wait a bit, then subscribe to name$
    subscription.add(concat(
      timer(1000).pipe(
        ignoreElements(), 
        tap({
          subscribe(): { console.log('Starting to wait'); }
          finalize(): { console.log('Done waiting'); }
        })
      ),
      name$.pipe(
        tap({
          subscribe(): { console.log('Now listening to name$')}
        })
      )
    ).subscribe(([name]) => {
      console.log('Now, the name is', name)
    }));

    // Trigger a change eventually
    subscription.add(timer(2000).subscribe(() => { setName('Jeff'); }));

    return subscription;
  });

}

// OUTPUT:
// Starting to wait
// .... 1000 ms elapses
// Done waiting
// Now listening to name$
// .... another 1000 ms elapses
// Name is Jeff
// Now, the name is Jeff
```

The only difference between this and `useObserve` is that `"Now, the name is Joel"` doesn't happen.  This is perfect for using the change as a signal to trigger the start or end of some process.

### `useSubject`

Subjects are the extension cords of RxJS.  If you think of an Observer like a lamp, and an Observable like the wall socket, then Subjects can help you have the two connected, even if they're in different sides of the room.

`useSubject` has a simple job: it creates an instance of a Subject that will be created on mount, and completed on unmount.  This uses a `ref` instead of a state, so it's the same object instance throughout the lifecycle of the component or hook, regardless of the re-renders.

### `useBehaviorSubject`

BehaviorSubjects are exactly like Subjects, but they're intended to be "stateful", like Signals in Knockout, Solid, etc.  They behave exactly like Subjects, except for three distinctions:

* They're instantiated with an initial value
* They have a `.value` data member that gives you the last emitted value (or the initial value if none has been emitted).
* When you subscribe to a BehaviorSubject, it immediately emits that current value first.