export type MultiVector<Positive, Negative, Zero> = {
  /** Just to prevent casting */
  readonly __basis: [Positive, Negative, Zero];
};

export function fromElements<Positive, Negative, Zero>(
  elements: number[]
): MultiVector<Positive, Negative, Zero> {
  return elements as any;
}

export function toElements<Positive, Negative, Zero>(
  mv: MultiVector<Positive, Negative, Zero>
): readonly number[] {
  return mv as any;
}
