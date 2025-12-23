import Fragment from "./fragment.ts";
import VirtualMachine, { RuntimeError } from "./machine.ts";

type ValueType =
    | "null"
    | "boolean"
    | "number"
    | "string"
    | "function"
    | "table";

export default class Value {
    constructor(public readonly type: ValueType) {}

    public toBoolean(): boolean {
        return true;
    }

    public toString(): string {
        return "<value>";
    }
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

export class Number extends Value {
    constructor(private readonly data: number) {
        super("number");
    }

    public toString(): string {
        return this.data.toString();
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
