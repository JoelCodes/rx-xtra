# Rx Xtra: LoopScan

LoopScan allows you to create an Observable through repetition, passing the last emitted value from one Internal Observable to the next, starting with a seed value.

With this function, you can perform iterations with state passed between loops, and unlike `generate`, you can be assured that only one iteration will be running at a time.

`rx-xtra.loop-scan` is part of [`Rx Xtra`](https://github.com/JoelCodes/rx-xtra), a collection of [RxJS](https://rxjs.dev/) utilities.

Created by Joel Shinness [LinkTree](https://linktr.ee/yesthatjoelshinness) • [Github](https://github.com/JoelCodes) • [Buy me a coffee!](https://ko-fi.com/yesthatjoelshinness)

## Usage

`loopScan<T>`

* Parameters
  * `factory`: `(state:T, index:number) => ObservableInput<T>` Accepts an index that starts at `0` and increments every repetition.  Returns an [`ObservableInput<T>`](https://rxjs.dev/api/index/type-alias/ObservableInput), e.g. an [`Observable<T>`](https://rxjs.dev/api/index/class/Observable), or anything that can be coerced into an `Observable<T>`, such as an Array, Promise, Iterable, or AsyncIterable.
  * `seed`: `T` Initial state to the system.
  * `countOrConfig?`: `number`|[`RepeatConfig`](https://rxjs.dev/api/index/interface/RepeatConfig)`& { startWithSeed?: boolean}` Limits how many repetitions are possible, and possibly introduces a delay between repetitions.  If no `count` is specified, the output Observable will never `complete`, though it may `error`.  If startWithSeed is `true`, the Observable will begin by emitting the seed value
* Returns
  * [`Observable<T>`](https://rxjs.dev/api/index/class/Observable)


`loopScan` provides a functionality similar to a for-loop in procedural JavaScript, creating an inner Observable from a `factory` function like [`rx-xtra.loop`](https://www.npmjs.com/package/rx-xtra.loop).  But unlike `loop`, the `factory` receives an initial value, allowing an arbritrary state to pass from iteration to iteration.

If there is a `RepeatConfig` or `number` given as the second parameter, it can limit the number of repetitions.

> NOTE: This operator has the potential to create a harmful infinite loop, so take the following advice:
> 1. If this is meant to run forever, make sure to include some delays or other asynchrony to keep it from taking over the stack.
> 2. If this is not meant to run forever, put in some limits, e.g. a `count` parameter; using the [`take`](https://rxjs.dev/api/index/function/take), ['takeUntil](https://rxjs.dev/api/index/function/takeUntil) or [`takeWhile`](https://rxjs.dev/api/index/function/takeWhile); or throwing an `error`.

## When Should I Use LoopScan?

The best part of RxJS is that there are always new functions you can write for it.

The worst part of RxJS is that there are always new functions you can write for it.

`loopScan` solves a very specific issue for me and the way I write RxJS: it allows me to write a lot of logic as individual chains of state, and then link those chains together.  It's great for connecting bits of logic that might be similar in their interface, but different in their implementation.  And it uses the FP model of using parameters and returns to pass state instead of mutating a source.

But it's a spicy pepper.  Proceed with caution.

### Iteration in Functional Programming

If you've ever studied FP languages, you may have experienced how any iteration can be written as a tail recursion.  For instance, the fibonacci sequence can be written with this iteration:

```ts
function fibIter(n:number){
  let a = 1, b = 1, remaining = n;
  for(let a = 1, b = 1; remaining > 0;){
    [a, b, remaining] = [b, a + b, remaining - 1];
  }
  return a;
}
```

There is a corresponding way to write this with functions, where, instead of mutating state, we pass the state as an argument to a looping function.

```ts
function fibRec(n:number){
  function fibRecInnerLoop(a:number, b:number, n:number){
    if(n <= 0) return a;
    return fibRecInnerLoop(b, a + b, n - 1);
  }

  return fibRecInnerLoop(1, 1, n);
}
```

This is such a great example of how FP actually accomplishes its mission of abolishing state.  But Since we don't have [tail call optimization](https://en.wikipedia.org/wiki/Tail_call) in JavaScript, it's more efficient to use the stateful version, since the program will basically save all those states on the stack if we use the functional version.

But we get a lot from Observables by using this method of looping.  In my personal coding, I found it was a great way of defining a repetitive process, but still keeping the ongoing state of something in mind.  Here's that fibonacci example again:

```ts
function fibLoopScan(n:number){
  return loopScan(
    ([a, b]) => of([b, a + b]), 
    [1, 1], 
    {count: n, startWithSeed: true}
  ).pipe(map(([a]) => a));
}

fibLoopScan(5).subscribe(console.log);

// Output:
// 1
// 1
// 2
// 3
// 5
// 8
```

### Chains
The biggest boon for me was being able to create a few of these factories, which I'd call "chains", and choose between them.  I'll even use the following type throughout some of these apps:

```ts
type Chain<T, TArg extends T = T> = (state:TArg) => ObservableInput<T>;
```

For instance, I've used RxJS to build a 2048 game, and created different chains to represent the different stages of the game:

```ts
type GameStatus = 'LOADING' | 'TITLE_SCREEN' | 'PLAYING';
type BaseGameState = {
  status: GameStatus;
  topScore: number
};

type LoadingState = BaseGameState & { status: 'LOADING' };
type TitleScreenState = BaseGameState & { status: 'TITLE_SCREEN' };
type PlayingState = BaseGameState & { status: 'PLAYING', score: number, gameOver: boolean };

type GameState = LoadingState | TitleScreenState | PlayingState;

function titleScreenChain(state:TitleScreenState):Observable<GameState>{
  return concat(
    transitionToTitleScreen(),
    waitForPlayerToClickStart(),
    of({...state, status: 'LOADING'})
  );
}

function loadingScreenChain(state:LoadingState):Observable<GameState>{
  return merge(
    transitionToLoadingScreen(),
    timer(5 * 1000).pipe(ignoreElements()),
    of({...state, status: 'PLAYING', score: 0, gameOver: false});
  )
}

function playingChain(state:PlayingState):Observable<GameState>{
  function updateBoardWithMove(state:PlayingState, move:PlayerMove):PlayingState {
    if(state.gameOver) return state;
    /* Game Logic Updates go here */
  }
  return merge(
    transitionToGameScreen(),
    playerMoves().pipe(
      scan(updateBoardWithMove, state),
      exhaustMap(state => {
        // If the game isn't over, keep going.
        if(!state.gameOver) return of(state);
        return concat(
          showGameOverModal(),
          waitForPlayerToClickOK(),
          of({ status: 'TITLE_SCREEN', topScore: state.topScore })
        )
      }),
      takeWhile(state => state.status === 'PLAYING', true),
    ),    
  )
}

const theWholeGame = loopScan((state:GameState):Observable<GameState> => {
  switch(state.status){
    case 'TITLE_SCREEN': return titleScreenChain(state);
    case 'LOADING': return loadingScreenChain(state);
    case 'PLAYING': return playingChain(state);
  }
  return NEVER;
}, {status: 'TITLE_SCREEN', topScore: 0})
```

Now, each chain is written on its own.

## See Also

* Like this looping but don't need all the state?  Just an index to let you know which repetition you're on?  Try [`rx-xtra.loop`](https://www.npmjs.com/package/rx-xtra.loop)!
* Just have an Observable you want to repeat?  Try [`repeat`](https://rxjs.dev/api/index/function/repeat)!
* Do you want to want to update a state based on the running output of an Observable? Try [`scan`](https://rxjs.dev/api/index/function/scan)!

