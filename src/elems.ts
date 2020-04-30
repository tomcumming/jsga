import { ElemIdx } from ".";

export function* sizedCombinations<T>(count: number, xs: T[]): Iterable<T[]> {
  if (count === 0) yield [];
  else if (count <= xs.length) {
    for (const tail of sizedCombinations(count - 1, xs.slice(1)))
      yield [xs[0], ...tail];
    yield* sizedCombinations(count, xs.slice(1));
  }
}

export function* combinations<T>(xs: T[]): Iterable<T[]> {
  for (let len = 0; len <= xs.length; len += 1)
    yield* sizedCombinations(len, xs);
}

export default function elems(
  positive: number,
  negative: number,
  zero: number
): ElemIdx[][] {
  let elemIdxs = [];
  for (let idx = 0; idx < positive + negative + zero; idx += 1)
    elemIdxs.push(idx);
  return Array.from(combinations(elemIdxs));
}
