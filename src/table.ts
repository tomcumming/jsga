import { ElemIdx } from ".";

type MultiVector =
  | 0
  | {
      scalar: -1 | 1;
      elems: Set<ElemIdx>;
    };

function mulElem(
  positive: number,
  negative: number,
  _zero: number,
  multiVector: MultiVector,
  right: ElemIdx
): MultiVector {
  if (multiVector === 0) return 0;

  let flipScalar = 1;
  for (const left of multiVector.elems) if (left > right) flipScalar *= -1;

  const newElems = new Set(multiVector.elems);
  if (newElems.has(right)) {
    newElems.delete(right);

    if (right < positive) {
      // noop
    } else if (right < positive + negative) {
      flipScalar *= -1;
    } else {
      return 0;
    }
  } else {
    newElems.add(right);
  }

  return {
    scalar: (multiVector.scalar * flipScalar) as -1 | 1,
    elems: newElems,
  };
}
