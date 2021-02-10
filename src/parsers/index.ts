import { Supplier } from "../utilities";

export interface IFile {
  cursor: number;
  input: string;
  stack: Object[];
}

export interface IParser {
  parse(value: IFile): boolean;
}

export class Sequence implements IParser {
  private children: IParser[];
  constructor(...children: IParser[]) {
    this.children = children;
  }

  parse(value: IFile) {
    const cursor0 = value.cursor;
    for (const child of this.children) {
      if (!child.parse(value)) {
        value.cursor = cursor0;
        return false;
      }
    }

    return true;
  }
}

export class ForwardReference implements IParser {
  private supplier: Supplier<IParser>;
  constructor(getter: () => IParser) {
    this.supplier = new Supplier(getter);
  }
  parse(value: IFile) {
    return this.supplier.get().parse(value);
  }
}

export class Repetition implements IParser {
  constructor(private child: IParser) {}
  parse(value: IFile) {
    while (this.child.parse(value));
    return true;
  }
}

export class Optional implements IParser {
  constructor(private child: IParser) {}
  parse(value: IFile) {
    this.child.parse(value);
    return true;
  }
}

export class Choice implements IParser {
  private children: IParser[];
  constructor(...children: IParser[]) {
    this.children = children;
  }
  parse(value: IFile) {
    for (const child of this.children) {
      if (child.parse(value)) return true;
    }

    return false;
  }
}

export class ComposeObject implements IParser {
  constructor(private child: IParser) {}
  parse(value: IFile) {
    const stack0 = value.stack.length;
    const success = this.child.parse(value);

    if (!success) return false;

    const object: Record<string, Object> = {};

    while (value.stack.length > stack0) {
      const val = value.stack.pop() as Object;
      const key = value.stack.pop() as string;
      object[key] = val;
    }

    value.stack.push(object);

    return true;
  }
}

export class ComposeArary implements IParser {
  constructor(private child: IParser) {}
  parse(value: IFile) {
    const stack0 = value.stack.length;
    const success = this.child.parse(value);

    if (!success) return false;

    const array: Object[] = [];

    while (value.stack.length > stack0) {
      array.push(value.stack.pop() as Object);
    }

    value.stack.push(array.reverse());

    return true;
  }
}

export class StringLiteralParser implements IParser {
  parse(value: IFile) {
    if (value.input.charAt(value.cursor) !== '"') return false;

    const last = value.input.substring(value.cursor + 1).indexOf('"');

    if (last < 0) return false;

    value.stack.push(
      value.input.substring(value.cursor + 1, value.cursor + 1 + last)
    );

    value.cursor += last + 2;
    this.skipWhitespace(value);

    return true;
  }

  private skipWhitespace(value: IFile): void {
    while (
      value.cursor < value.input.length &&
      [" ", "\n"].includes(value.input.charAt(value.cursor))
    ) {
      ++value.cursor;
    }
  }
}

export class NumberParser implements IParser {
  parse(value: IFile) {
    const match = value.input.substring(value.cursor).match(/^[0-9]+/);

    if (!match) return false;

    const [num = ""] = match;

    if (num.length) {
      value.cursor += num.length;
      value.stack.push(Number(num));
    }

    return true;
  }
}

export class CharParser implements IParser {
  constructor(private char: string) {}
  parse(value: IFile) {
    const success = value.input.charAt(value.cursor) == this.char;
    if (!success) return false;

    ++value.cursor;
    this.skipWhitespace(value);
    return true;
  }

  private skipWhitespace(value: IFile): void {
    while (
      value.cursor < value.input.length &&
      [" ", "\n"].includes(value.input.charAt(value.cursor))
    ) {
      ++value.cursor;
    }
  }
}
