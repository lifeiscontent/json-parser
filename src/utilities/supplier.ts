export class Supplier<T> {
  constructor(private value: T | (() => T)) {}
  public get() {
    if (this.value instanceof Function) {
      return this.value();
    }

    return this.value;
  }
}
