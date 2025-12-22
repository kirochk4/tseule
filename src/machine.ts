import Fragment, { Constant } from "./fragment.ts";
import { Closure, Table, Value } from "./value.ts";

export enum Code {
    pop,
    close,

    add,
    sub,
    mul,
    pow,
    div,
    idv,
    mod,

    neg,
    pos,

    and,
    or,
    xor,
    lsh,
    rsh,
    inv,

    not,
    eq,
    lt,
    gt,

    getLocal,
    setLocal,
    getGlobal,
    setGlobal,
    getUpvalue,
    setUpvalue,
}

class Frame {
    private pc: number = 0;

    constructor(
        private readonly closure: Closure,
        private readonly slots: number,
        private readonly vm: VirtualMachine,
    ) {}

    private readByte(): number {
        return this.closure.fragment.code[this.pc++]!;
    }

    private readShort(): number {
        const big = this.readByte();
        const small = this.readByte();
        return (big << 8) | small;
    }

    private readConstant(): Constant {
        return this.closure.fragment.constants[this.readByte()];
    }

    private readValue(): Value {
        return new Value(this.readConstant() as string | number);
    }

    private readString(): string {
        return this.readConstant() as string;
    }

    private readFragment(): Fragment {
        return this.readConstant() as Fragment;
    }

    private getLocal(index: number): Value {
        return this.vm.stack[this.slots + index];
    }

    private setLocal(index: number, value: Value) {
        this.vm.stack[this.slots + index] = value;
    }

    public execute() {
        for (;;) {
            const code = this.readByte();
            switch (code) {
                case Code.pop:
                    this.vm.pop();
                    break;
                case Code.getLocal:
                    this.vm.push(this.getLocal(this.readByte()));
                    break;
                case Code.setLocal:
                    this.setLocal(this.readByte(), this.vm.pop());
                    break;
                case Code.getGlobal:
                    this.vm.push(this.vm.global.get(this.readValue()));
                    break;
                case Code.setGlobal:
                    this.vm.global.set(this.readValue(), this.vm.pop());
                    break;
                case Code.getUpvalue:
                    this.vm.push(this.closure.upvalues[this.readByte()].value);
                    break;
                case Code.setUpvalue:
                    this.closure.upvalues[this.readByte()].value =
                        this.vm.pop();
                    break;
                case Code.or:
                case Code.add: {
                    const v2 = this.vm.peek(0);
                    const v1 = this.vm.peek(1);
                    if (v1.type === "string" && v2.type === "string") {
                        this.vm.push(
                            new Value(
                                (v1.data as string) + (v2.data as string),
                            ),
                        );
                        break;
                    }
                }
                /* falls through */
                case Code.sub:
                case Code.mul:
                case Code.div:
                case Code.mod:
                case Code.idv: {
                    const v2 = this.vm.pop();
                    const v1 = this.vm.pop();
                    if (v1.type === "number" && v2.type === "number") {
                        const op = numOps.get(code)!;
                        this.vm.push(op(v1.data as number, v2.data as number));
                        break;
                    }
                    throw new RuntimeError(
                        `attempt to ${opNames.get(code)} a '${
                            v1.type
                        }' with a '${v2.type}'`,
                    );
                }
            }
        }
    }
}

enum MetaMethod {
    call = "__call",

    add = "__add",
    sub = "__sub",
    mul = "__mul",
    pow = "__pow",
    div = "__div",
    idv = "__idv",
    mod = "__mod",

    neg = "__neg",
    pos = "__pos",

    and = "__and",
    or = "__or",
    xor = "__xor",
    lsh = "__lsh",
    rsh = "__rsh",
    inv = "__inv",

    not = "__not",
    eq = "__eq",
    lt = "__lt",
    gt = "__gt",

    index = "__index",
    newIndex = "__new_index",
}

const idv = (a: number, b: number): number => Math.floor(a / b);

const numOps = new Map([
    [Code.add, (v1: number, v2: number): Value => new Value(v1 + v2)],
    [Code.sub, (v1: number, v2: number): Value => new Value(v1 - v2)],
    [Code.mul, (v1: number, v2: number): Value => new Value(v1 * v2)],
    [Code.div, (v1: number, v2: number): Value => new Value(v1 / v2)],
    [Code.mod, (v1: number, v2: number): Value => new Value(v1 % v2)],
    [Code.idv, (v1: number, v2: number): Value => new Value(idv(v1, v2))],
]);

const opNames = new Map([
    [Code.add, "add"],
    [Code.sub, "sub"],
    [Code.mul, "mul"],
    [Code.div, "div"],
    [Code.mod, "mod"],
    [Code.idv, "idv"],
]);

export default class VirtualMachine {
    public readonly stack: Value[] = new Array();
    public readonly global: Table = new Table();
    private readonly tables = {
        boolean: new Table(),
        number: new Table(),
        string: new Table(),
        function: new Table(),
    };

    constructor() {}

    run() {}

    push(value: Value) {
        this.stack.push(value);
    }

    pop(): Value {
        return this.stack.pop();
    }

    peek(index: number): Value {
        return this.stack.at(-1 - index);
    }

    callMetaMethod(value: Value, methodName: MetaMethod) {
        let metaTable: Table;
        switch (value.type) {
            case "null":
                throw new RuntimeError(
                    `'null' have no metatable to call ${methodName}`,
                );
            case "boolean":
                metaTable = this.tables.boolean;
            case "number":
                metaTable = this.tables.number;
            case "string":
                metaTable = this.tables.string;
            case "table":
                if ((value.data as Table).prototype === undefined)
                    throw new RuntimeError(
                        `'table' have no metatable to call ${methodName}`,
                    );
                metaTable = (value.data as Table).prototype;

            case "function":
                metaTable = this.tables.function;
        }
        const method = (value.data as Table).prototype.get(
            new Value(methodName),
        );
        this.callValue(method);
    }

    private callValue(callee: Value) {
        switch (callee.type) {
            case "function":
                this.callFunction(callee);
                break;
            default:
                this.callMetaMethod(callee, MetaMethod.call);
        }
    }

    private callFunction(callee: Value) {
        if (typeof callee.data === "function") {
            
        }
    }
}

export class RuntimeError extends Error {
    constructor(message: string) {
        super(message);
    }
}
