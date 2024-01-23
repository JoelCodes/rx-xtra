import {Observable, type OperatorFunction} from 'rxjs';

/**
 * Operator to perform data validation and conversion in one step.  If the project function throws an error, the item can be ignored.
 * 
 * @example
 * ```ts
 * import { from } from 'rxjs';
 * import { z } from 'zod';
 * import { safeMap } from 'rx-xtra.safe-map';
 *
 * const data = [
 *   'Not JSON',
 *   '{"error": "invalid JSON"}',
 *   '{"msg": "Valid Object"}',
 * ];
 *
 * const template = z.object({
 *   'msg': z.string()
 * });
 *
 * function validate(input:string):z.infer<typeof template>{
 *   const parsedJSON = JSON.parse(input);
 *   const validObject = template.parse(parsedJSON);
 *   return validObject;
 * }
 *
 * from(data).pipe(
 *   safeMap(
 *   validate, 
 *   (err) => { 
 *     console.log('Validation Error:', err.message); 
 *   })
 * ).subscribe((val) => { 
 *   console.log('Next:', val.msg); 
 * });
 *
 * // OUTPUT:
 * // Validation Error: Unexpected token 'N', "Not JSON" is not valid JSON
 * // Validation Error: [
 * //   {
 * //     "code": "invalid_type",
 * //     "expected": "string",
 * //     "received": "undefined",
 * //     "path": [
 * //       "msg"
 * //     ],
 * //     "message": "Required"
 * //   }
 * // ]
 * // Next: Valid Object
 * ```

 * @param project Function to map the value.  If it can't be mapped, it should throw an error
 * @param onError Catches the error for logging or other purposes.  If it throws an error, the generated Observable will error out.
 * @returns OperatorFunction that will map the value or catch the error
 */
export function safeMap<A, B>(project: (value: A, index: number) => B, onError?: (err: any) => void): OperatorFunction<A, B> {
  return source => new Observable<B>(destination => {
    let index = 0;
    const observer = {
      next(value: A) {
        try {
          destination.next(project(value, index++));
        } catch (err) {
          try {
            if (onError) {
              onError(err);
            }
          } catch (err) {
            destination.error(err);
          }
        }
      },
      complete() {
        destination.complete();
      },
      error(err: any) {
        destination.error(err);
      },
    };
    return source.subscribe(observer);
  });
}
