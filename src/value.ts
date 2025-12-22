import Fragment from "./fragment.ts";
import VirtualMachine, { RuntimeError } from "./machine.ts";

type ValueType =
    | "null"
    | "boolean"
    | "number"
    | "string"
    | "function"
    | "table";

export class Value {
    constructor(
        public readonly data?:
            | boolean
            | number
            | string
            | Closure
            | Native
            | Table,
    ) {}

    public get type(): ValueType {
        switch (typeof this.data) {
            case "undefined":
                return "null";
            case "boolean":
                return "boolean";
            case "number":
                return "number";
            case "string":
                return "string";
            case "function":
                return "function";
            case "object":
                if (this.data instanceof Table) return "table";
                if (this.data instanceof Closure) return "function";
        }
        throw new Error("unreachable!");
    }

    public toString(): string {
        switch (typeof this.data) {
            case "undefined":
                return "null";
            case "boolean":
                return this.data ? "true" : "false";
            case "number":
                return this.data.toString();
            case "string":
                return this.data;
            case "function":
                return "[function]";
            case "object":
                if (this.data instanceof Table) return "[table]";
                if (this.data instanceof Closure) return "[function]";
        }
        throw new Error("unreachable!");
    }

    public toBoolean(): boolean {
        switch (typeof this.data) {
            case "boolean":
                return this.data;
            case "undefined":
                return false;
        }
        return true;
    }
}

class Upvalue {
    private closed?: Value;
    public next?: Upvalue;

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

export class Closure {
    public readonly upvalues: Upvalue[];
    constructor(public readonly fragment: Fragment) {}
}

export type Native = (vm: VirtualMachine) => Value;

export class Table {
    private readonly pairs: Map<string, Value> = new Map();

    constructor(public prototype: Table | undefined = undefined) {}

    public get(key: Value): Value {
        if (key === undefined) return new Value();
        else
            return (
                this.pairs.get(key.toString()) ||
                (this.prototype ? this.prototype.get(key) : new Value())
            );
    }

    public set(key: Value, value: Value) {
        if (key === undefined) throw new RuntimeError("table index is null");
        if (value === undefined) this.pairs.delete(key.toString());
        else this.pairs.set(value.toString(), value);
    }
}
