import { Relation } from "./Relation";

export type TotalOrderingFn<T> = (a: T, b: T) => number;
export type PartialOrderingFn<T> = (a: T, b: T) => Relation;
export type OrderingFn<T> = TotalOrderingFn<T> | PartialOrderingFn<T>;
