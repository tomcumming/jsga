import { ElemIdx } from ".";

export function* combinations<T>(xs: T[]): Iterable<T[]> {
  yield [];

  function* go(xs: T[]): Iterable<T[]> {
    if (xs.length > 0) {
      for (const x of xs) yield [x];
      for (const tails of go(xs.slice(1))) yield [xs[0], ...tails];
    }
  }

  yield* go(xs);
}

export default function elems(
  positive: number,
  negative: number,
  zero: number
): Set<ElemIdx>[] {
  let elemIdxs = [];
  for (let idx = 0; idx < positive + negative + zero; idx += 1)
    elemIdxs.push(idx);
  return Array.from(combinations(elemIdxs)).map((xs) => new Set(xs));
}
