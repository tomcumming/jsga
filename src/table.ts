import { ElemIdx, Scalar } from ".";
import elems, { combinations } from "./elems";

/** This is the sign(or zero) and the result element */
export type TableEntry = [Scalar, ElemIdx];
export type MultTable = { [left: number]: { [right: number]: TableEntry } };

type MultiVector =
  | 0
  | {
      scalar: -1 | 1;
      elems: Set<ElemIdx>;
    };

function mulElem(
  positive: number,
  _negative: number,
  zero: number,
  multiVector: MultiVector,
  right: ElemIdx
): MultiVector {
  if (multiVector === 0) return 0;

  let flipScalar = 1;
  for (const left of multiVector.elems) if (left > right) flipScalar *= -1;

  const newElems = new Set(multiVector.elems);
  if (newElems.has(right)) {
    newElems.delete(right);

    if (right < zero) {
      return 0;
    } else if (right >= zero + positive) {
      flipScalar *= -1;
    }
  } else {
    newElems.add(right);
  }

  return {
    scalar: (multiVector.scalar * flipScalar) as -1 | 1,
    elems: newElems,
  };
}

function elementIndex(allElems: Set<ElemIdx>[], elems: Set<ElemIdx>): number {
  const found = allElems.findIndex(
    (es) =>
      Array.from(es).every((e) => elems.has(e)) &&
      Array.from(elems).every((e) => es.has(e))
  );
  if (found === -1) throw `Could not find element index`;
  return found;
}

export default function makeTable(
  positive: number,
  negative: number,
  zero: number
): MultTable {
  const es = elems(positive, negative, zero);

  let ret: MultTable = {};

  for (let leftIdx = 0; leftIdx < es.length; leftIdx += 1) {
    ret[leftIdx] = {};

    for (let rightIdx = 0; rightIdx < es.length; rightIdx += 1) {
      let mv: MultiVector = { scalar: 1, elems: es[leftIdx] };
      for (const right of Array.from(es[rightIdx]).sort())
        mv = mulElem(positive, negative, zero, mv, right);
      if (mv === 0) ret[leftIdx][rightIdx] = [0, 0];
      else {
        const elemIdx = elementIndex(es, mv.elems);
        ret[leftIdx][rightIdx] = [mv.scalar, elemIdx];
      }
    }
  }

  return ret;
}
