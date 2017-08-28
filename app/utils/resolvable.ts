import {IPromise} from "angular";

/**
 * This module defines `Resolvable` references and some utilities to manipulate them.
 * A `Resolvable` reference is a reference to an object or array that will be populated once a promise is resolved.
 * It is called a `Resolvable` because it can be used in the resolve section of `$routeProvider.when`.
 */

/**
 * Represents a reference for the result of a promise, it will be populated once the promise is resolved.
 */
export type Resolvable<T> = T & ResolvableState;

/**
 * Metadata attached to the resolvable to represent its state.
 */
export interface ResolvableState {
  $resolved: boolean;
  $promise: IPromise<this>;
}

/**
 * Create a reference for an array that will be filled once the promise is resolved.
 *
 * @param promise The promise to wrap.
 * @return The resolvable array reference for the supplied promise.
 */
export function toResolvableArray<T>(promise: IPromise<T[]>): Resolvable<T[]> {
  const resolvable: Resolvable<T[]> = <T[]> [] as any;
  resolvable.$resolved = false;
  resolvable.$promise = promise.then((result: T[]): Resolvable<T[]> => {
    resolvable.$resolved = true;
    for (const item of result) {
      resolvable.push(item);
    }
    return resolvable;
  });
  return resolvable;
}

/**
 * Create a reference for an document that will be filled once the promise is resolved.
 *
 * @param promise The promise to wrap.
 * @return The resolvable document reference for the supplied promise.
 */
export function toWhenableDocument<T>(promise: IPromise<T>): Resolvable<T> {
  const resolvable: Resolvable<T> = <T> Object.create(null) as any;
  resolvable.$resolved = false;
  resolvable.$promise = promise.then((result: T): Resolvable<T> => {
    resolvable.$resolved = true;
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        resolvable[key] = result[key];
      }
    }
    return resolvable;
  });
  return resolvable;
}
