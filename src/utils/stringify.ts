import { isPlainObject } from './isPlainObject';

export const stringify = (value: any) =>
  JSON.stringify(value, (key, value) =>
    isPlainObject(value)
      ? Object.keys(value)
          .sort()
          .reduce<any>((acc, key) => {
            acc[key] = value[key];
            return acc;
          }, {})
      : value,
  );
