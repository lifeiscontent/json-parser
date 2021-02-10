# JSON Parser

Simple JSON parser

# Usage

```ts
import { Parser } from "json-parser";

const file = {
  cursor: 0,
  stack: [],
  input: `{
    "foo": "bar",
    "baz": "qux"
  }`,
};

if (new Parser().parse(file)) {
  console.log(file.stack[0]); // Outputs JSON as JS Object
}
```
