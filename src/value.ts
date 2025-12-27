import Fragment from "./fragment.ts";
import VirtualMachine, { RuntimeError } from "./machine.ts";

type ValueType =
  | "null"
  | "boolean"
  | "integer"
  | "float"
  | "string"
  | "function"
  | "table";

export default abstract class Value {
  protected constructor(public readonly type: ValueType) {}

  public toBoolean(): boolean {
    return true;
  }

  public abstract toString(): string;
}

export abstract class Number extends Value {
  protected constructor(
    protected readonly data: number | bigint,
    type: ValueType,
  ) {
    super(type);
  }

  // TODO: add all methods
  public abstract add(v: Number): Number;
  public abstract sub(v: Number): Number;
  public abstract mul(v: Number): Number;
  public abstract pow(v: Number): Number;
  public abstract div(v: Number): Number;
  public abstract idv(v: Number): Number;
  public abstract mod(v: Number): Number;
  public abstract and(v: Number): Number;
  public abstract or(v: Number): Number;
  public abstract xor(v: Number): Number;
  public abstract lt(v: Number): Number;
  public abstract gt(v: Number): Number;
  public abstract unm(): Number;
  public abstract unp(): Number;
  public abstract rev(): Number;
}

export class Null extends Value {
  constructor() {
    super("null");
  }

  public toString(): string {
    return "null";
  }

  public toBoolean(): boolean {
    return false;
  }
}

export class Boolean extends Value {
  constructor(private readonly data: boolean) {
    super("boolean");
  }

  public toString(): string {
    return this.data ? "true" : "false";
  }

  public toBoolean(): boolean {
    return this.data;
  }
}

export class Integer extends Number {
  static maxInt64 = 0x7fff_ffff;
  static minInt64 = -0x8000_0000;

  constructor(readonly data: bigint) {
    super(data, "integer");
  }

  // TODO: no dot
  public toString(): string {
    return this.data.toString();
  }

  public add(v: Number): Number {
    return new Float(0);
  }
  public sub(v: Number): Number {
    return new Float(0);
  }
  public mul(v: Number): Number {
    return new Float(0);
  }
  public pow(v: Number): Number {
    return new Float(0);
  }
  public div(v: Number): Number {
    return new Float(0);
  }
  public idv(v: Number): Number {
    return new Float(0);
  }
  public mod(v: Number): Number {
    return new Float(0);
  }
  public and(v: Number): Number {
    return new Float(0);
  }
  public or(v: Number): Number {
    return new Float(0);
  }
  public xor(v: Number): Number {
    return new Float(0);
  }
  public lt(v: Number): Number {
    return new Float(0);
  }
  public gt(v: Number): Number {
    return new Float(0);
  }
  public unm(): Number {
    return new Float(0);
  }
  public unp(): Number {
    return new Float(0);
  }
  public rev(): Number {
    return new Float(0);
  }
}

export class Float extends Number {
  constructor(readonly data: number) {
    super(data, "float");
  }

  // TODO: always with dot
  public toString(): string {
    return this.data.toString();
  }

  public add(v: Number): Number {
    return new Float(0);
  }
  public sub(v: Number): Number {
    return new Float(0);
  }
  public mul(v: Number): Number {
    return new Float(0);
  }
  public pow(v: Number): Number {
    return new Float(0);
  }
  public div(v: Number): Number {
    return new Float(0);
  }
  public idv(v: Number): Number {
    return new Float(0);
  }
  public mod(v: Number): Number {
    return new Float(0);
  }
  public and(v: Number): Number {
    return new Float(0);
  }
  public or(v: Number): Number {
    return new Float(0);
  }
  public xor(v: Number): Number {
    return new Float(0);
  }
  public lt(v: Number): Number {
    return new Float(0);
  }
  public gt(v: Number): Number {
    return new Float(0);
  }
  public unm(): Number {
    return new Float(0);
  }
  public unp(): Number {
    return new Float(0);
  }
  public rev(): Number {
    return new Float(0);
  }
}

export class String extends Value {
  constructor(private readonly data: string) {
    super("string");
  }

  public toString(): string {
    return this.data;
  }
}

export class Table extends Value {
  private readonly pairs: Map<string, Value> = new Map();

  constructor(public prototype: Table | undefined = undefined) {
    super("table");
  }

  public toString(): string {
    return "<table>";
  }

  public get(key: Value): Value {
    if (key.type === "null") return new Null();
    else
      return (
        this.pairs.get(key.toString()) ||
        (this.prototype ? this.prototype.get(key) : new Null())
      );
  }

  public set(key: Value, value: Value) {
    if (key.type === "null") throw new RuntimeError("table index is null");
    if (value.type === "null") this.pairs.delete(key.toString());
    else this.pairs.set(value.toString(), value);
  }
}

class UpValue {
  private closed?: Value;
  public next?: UpValue;

  constructor(private location: number, private readonly where: Value[]) {}

  public get value(): Value {
    if (this.location < 0) return this.closed;
    return this.where[this.location];
  }

  public set value(value: Value) {
    if (this.location < 0) this.closed = value;
    else this.where[this.location] = value;
  }

  public close() {
    this.closed = this.where[this.location];
    this.location = -1;
  }
}

export class Closure extends Value {
  public readonly upvalues: UpValue[];

  constructor(public readonly fragment: Fragment) {
    super("function");
  }

  public toString(): string {
    return "<function>";
  }
}

export class Native extends Value {
  constructor(public readonly data: (vm: VirtualMachine) => Value) {
    super("function");
  }

  public toString(): string {
    return "<function>";
  }
}
