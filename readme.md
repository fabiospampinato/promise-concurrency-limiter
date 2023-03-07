# Promise Concurrency Limiter

Tiny scheduler for functions returning promises that can limit their concurrency.

## Install

```sh
npm install --save promise-concurrency-limiter
```

## Usage

```ts
import Limiter from 'promise-concurrency-limiter';

const limiter = new Limiter ({
  concurrency: 2 // Limit the number of simultaneously active promises to 2
});

const somePromiseReturningFunction = async () => { /* ... */ };

limiter.add ( somePromiseReturningFunction ); // First function added, executed immediately
limiter.add ( somePromiseReturningFunction ); // Second function added, executed immediately
limiter.add ( somePromiseReturningFunction ); // Third function added, executed immediately only if one of the 2 available slots got freed, deferred otherwise
```

## Deadlocks

Note that if your concurrency-limited functions can also schedule other concurrency-limited functions you can get in a deadlock situation, where if the concurrency limit is N, and you have N currently executing functions, but all of those functions need to schedule other functions before they can resolve, then nothing will happen because all the available spots are filled already, and no current function will ever resolve.

For situations like that, unless you have some assurances that a deadlock can't actually happen, this library may not be the appropriate way to limit concurrency for your use case.

## License

MIT © Fabio Spampinato
