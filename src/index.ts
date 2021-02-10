import {
  CharParser,
  Choice,
  ComposeArary,
  ComposeObject,
  ForwardReference,
  IFile,
  IParser,
  NumberParser,
  Optional,
  Repetition,
  Sequence,
  StringLiteralParser,
} from "./parsers";

export class Parser implements IParser {
  public parse(value: IFile) {
    return this.value.parse(value);
  }

  private pair: IParser = new Sequence(
    new StringLiteralParser(),
    new CharParser(":"),
    new ForwardReference(() => this.value)
  );

  private pairTails: IParser = new Repetition(
    new Sequence(new CharParser(","), this.pair)
  );

  private pairs = new Optional(new Sequence(this.pair, this.pairTails));

  private object: IParser = new ComposeObject(
    new Sequence(new CharParser("{"), this.pairs, new CharParser("}"))
  );

  private valueTails: IParser = new Repetition(
    new Sequence(new CharParser(","), new ForwardReference(() => this.value))
  );

  private values = new Optional(
    new Sequence(new ForwardReference(() => this.value), this.valueTails)
  );

  private array: IParser = new ComposeArary(
    new Sequence(new CharParser("["), this.values, new CharParser("]"))
  );

  private value: IParser = new Choice(
    new StringLiteralParser(),
    new NumberParser(),
    this.object,
    this.array
  );
}
