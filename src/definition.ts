export class AkmjType<T> {
  constructor(public type: T) {}

  optional(): AkmjType<T | undefined> {
    return new AkmjType(this.type as T | undefined);
  }

  nullable(): AkmjType<T | null> {
    return new AkmjType(this.type as T | null);
  }

  array(): AkmjType<T[]> {
    return new AkmjType(this.type as T[]);
  }
}

export class akmj {
  static string(): AkmjType<string> {
    return new AkmjType("" as string);
  }

  static object<T extends object>(obj: T): AkmjType<T> {
    return new AkmjType(obj);
  }

  static number(): AkmjType<number> {
    return new AkmjType(1 as number);
  }

  static bool(): AkmjType<boolean> {
    return new AkmjType(true as boolean);
  }

  static bigint(): AkmjType<bigint> {
    return new AkmjType(1n as bigint);
  }
}
