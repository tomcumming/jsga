import "./table";
import "./elems";
import makeTable, { MultTable } from "./table";
import { fromElements, MultiVector, toElements } from "./multivector";
import { Scalar, ElemIdx } from ".";
import elems from "./elems";

export class Algebra<
  Positive extends number,
  Negative extends number,
  Zero extends number
> {
  private readonly table: MultTable;
  private readonly elems: ElemIdx[][];
  readonly elements: number;
  readonly zero: MultiVector<Positive, Negative, Zero>;

  constructor(
    readonly positives: Positive,
    readonly negatives: Negative,
    readonly zeros: Zero
  ) {
    this.table = makeTable(positives, negatives, zeros);
    this.elems = elems(positives, negatives, zeros);

    this.elements = positives + negatives + zeros;
    this.zero = makeZero(this.elements);
  }

  /** Look up a single element from this multivector.
   * For example `elem(mv, 0, 1)` would give you e01 */
  elem(
    mv: MultiVector<Positive, Negative, Zero>,
    ...vectors: ElemIdx[]
  ): Scalar {
    const idx = this.elems.findIndex(
      (es) =>
        vectors.length === es.length && vectors.every((v, idx) => v === es[idx])
    );
    if (idx === -1) throw new Error(`Could not find element`);
    else return toElements(mv)[idx];
  }

  muls(
    left: MultiVector<Positive, Negative, Zero>,
    right: Scalar
  ): MultiVector<Positive, Negative, Zero> {
    return fromElements(toElements(left).map((left) => left * right));
  }

  mul(
    left: MultiVector<Positive, Negative, Zero>,
    right: MultiVector<Positive, Negative, Zero>
  ): MultiVector<Positive, Negative, Zero> {
    const leftEs = toElements(left);
    const rightEs = toElements(right);

    const ret = toElements(this.zero).slice();

    for (let leftIdx = 0; leftIdx < this.elements; leftIdx += 1) {
      const leftVal = leftEs[leftIdx];
      if (leftVal !== 0) {
        for (let rightIdx = 0; rightIdx < this.elements; rightIdx += 1) {
          const rightVal = rightEs[rightIdx];
          if (rightVal !== 0) {
            const place = this.table[leftIdx * this.elements + rightIdx];
            if (place !== 0) {
              const idx = Math.abs(place) - 1;
              const sign = Math.sign(place);
              ret[idx] += leftVal * rightVal * sign;
            }
          }
        }
      }
    }

    return fromElements(ret);
  }
}

function makeZero(elements: number): MultiVector<any, any, any> {
  let ret = [];
  for (let idx = 0; idx < elements; idx += 1) ret.push(0);
  return fromElements(ret);
}
