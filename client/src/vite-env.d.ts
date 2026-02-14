/// <reference types="vite/client" />

type OptionalRecord<K extends PropertyKey, T> = {
    [P in K]?: T;
};

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;
