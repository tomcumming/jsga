import "./table";
import "./elems";

export type ElemIdx = number;
export type Scalar = number;

export class Algebra<
  Positive extends number,
  Negative extends number,
  Zero extends number
> {
  constructor(positive: Positive, negative: Negative, zero: Zero) {}
}
