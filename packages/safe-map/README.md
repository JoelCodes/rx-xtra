# Rx Xtra: SafeMap

`safeMap` allows you to perform data validation and conversion with one operator.  Great for use with `JSON.parse` and [Zod](https://zod.dev/).

If the validation / conversion throws an error, then the emitted signal is ignored, but the Observable continues.

`rx-xtra.safe-map` is part of [`Rx Xtra`](https://github.com/JoelCodes/rx-xtra), a collection of [RxJS](https://rxjs.dev/) utilities.

Created by Joel Shinness [LinkTree](https://linktr.ee/yesthatjoelshinness) • [Github](https://github.com/JoelCodes) • [Buy me a coffee!](https://ko-fi.com/yesthatjoelshinness)

## Usage

`safeMap<A, B>`

* Parameters
  * `project`: `(value:A, index:number) => B` converts a value of type `A` into a value of type `B`.  If this function throws an error, then the item is ignored.
  * `onError`: `(err:any) => void` gets called with the validation error if one exists.  If this function throws an error, then the entire Observable errors.
* Returns
  * [`OperatorFunction<A, B>`](https://rxjs.dev/api/index/interface/OperatorFunction)

```ts
import { from } from 'rxjs';
import { z } from 'zod';
import { safeMap } from 'rx-xtra.safe-map';

const data = [
  'Not JSON',
  '{"error": "invalid JSON"}',
  '{"msg": "Valid Object"}',
];

const template = z.object({
  'msg': z.string()
});

function validate(input:string):z.infer<typeof template>{
  const parsedJSON = JSON.parse(input);
  const validObject = template.parse(parsedJSON);
  return validObject;
}

from(data).pipe(
  safeMap(
    validate, 
    (err) => { console.log('Validation Error:', err.message); 
  })
).subscribe((val) => { console.log('Next:', val.msg); });

// OUTPUT:
// Validation Error: Unexpected token 'N', "Not JSON" is not valid JSON
// Validation Error: [
//   {
//     "code": "invalid_type",
//     "expected": "string",
//     "received": "undefined",
//     "path": [
//       "msg"
//     ],
//     "message": "Required"
//   }
// ]
// Next: Valid Object
```
