type NonUndefined<T> = T extends undefined ? never : T;

export const cleanByAllowedKeys = <
  TInput extends object,
  K extends keyof TInput,
>(
  data: TInput,
  allowedKeys: readonly K[],
): Partial<{ [P in K]: NonUndefined<TInput[P]> }> => {
  const output: Partial<{ [P in K]: NonUndefined<TInput[P]> }> = {};

  for (const key of allowedKeys) {
    const value = data[key];
    if (value !== undefined) {
      output[key] = value as NonUndefined<TInput[typeof key]>;
    }
  }

  return output;
};

export const pickByKeys = <TInput extends object, K extends keyof TInput>(
  data: TInput,
  keys: readonly K[],
): Pick<TInput, K> => {
  const output = {} as Pick<TInput, K>;

  for (const key of keys) {
    output[key] = data[key];
  }

  return output;
};
