import "./table";
import "./elems";
import makeTable, { MultTable } from "./table";
import { fromElements, MultiVector, toElements } from "./multivector";
import { Scalar, ElemIdx } from ".";
import elems from "./elems";

type ArrayIdx = number;

export class Algebra<
  Positive extends number,
  Negative extends number,
  Zero extends number
> {
  private readonly table: MultTable;
  private readonly elems: ElemIdx[][];
  private readonly blades: ArrayIdx[][];
  readonly elements: number;
  readonly zero: MultiVector<Positive, Negative, Zero>;

  constructor(
    readonly positives: Positive,
    readonly negatives: Negative,
    readonly zeros: Zero
  ) {
    this.table = makeTable(positives, negatives, zeros);
    this.elems = elems(positives, negatives, zeros);
    this.blades = makeBlades(this.elems);

    this.elements = 2 ** (positives + negatives + zeros);
    this.zero = makeZero(this.elements);
  }

  scalar(s: number): MultiVector<Positive, Negative, Zero> {
    const mv = toElements(this.zero).slice();
    mv[0] = s;
    return fromElements(mv);
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

  dual(
    mv: MultiVector<Positive, Negative, Zero>
  ): MultiVector<Positive, Negative, Zero> {
    return fromElements(toElements(mv).slice().reverse());
  }

  reverse(
    mv: MultiVector<Positive, Negative, Zero>
  ): MultiVector<Positive, Negative, Zero> {
    const elems = toElements(mv).slice();
    for (const blade of this.blades.filter((_, idx) => idx % 4 >= 2))
      for (const idx of blade) elems[idx] *= -1;
    return fromElements(elems);
  }

  add(
    left: MultiVector<Positive, Negative, Zero>,
    right: MultiVector<Positive, Negative, Zero>
  ): MultiVector<Positive, Negative, Zero> {
    const rightElems = toElements(right);
    return fromElements(
      toElements(left).map((left, idx) => left + rightElems[idx])
    );
  }

  sub(
    left: MultiVector<Positive, Negative, Zero>,
    right: MultiVector<Positive, Negative, Zero>
  ): MultiVector<Positive, Negative, Zero> {
    const rightElems = toElements(right);
    return fromElements(
      toElements(left).map((left, idx) => left - rightElems[idx])
    );
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

function makeBlades(elems: ElemIdx[][]): ArrayIdx[][] {
  let idx = 0;
  let blades = new Map<number, ArrayIdx[]>();
  for (const elem of elems) {
    const elemCount = elem.length;
    const existing = blades.get(elemCount);
    if (existing) existing.push(idx);
    else blades.set(elemCount, [idx]);
    idx += 1;
  }

  return Array.from(blades.values()); // Hopefully sorted
}
