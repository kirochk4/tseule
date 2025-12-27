import Compiler from "./compiler.ts";
import Scanner from "./scanner.ts";
import Value, {
  Boolean,
  Closure,
  Float,
  Integer,
  Native,
  Null,
  Number,
  String,
  Table,
} from "./value.ts";

export enum Code {
  move,
  load,
  loadBool,
  loadNull,

  getGlobal,
  getTable,
  safeGetTable,
  getUpValue,
  setGlobal,
  setTable,
  setUpValue,

  newTable,

  call,
  return,

  add,
  sub,
  mul,
  pow,
  div,
  idv,
  mod,

  and,
  or,
  xor,

  rev,
  unm,
  unp,
  not,

  eq,
  lt,
  gt,

  jump,

  closure,
  close,

  vararg,
}

const isReg = 1;

class Frame {
  private pc: number = 0;

  constructor(
    private readonly closure: Closure,
    private readonly slots: number,
    private readonly vm: VirtualMachine,
  ) {}

  private get code(): number {
    return this.closure.fragment.code[this.pc]!;
  }

  private get a(): number {
    return this.closure.fragment.code[this.pc + 1]!;
  }

  private get b(): number {
    return this.closure.fragment.code[this.pc + 2]!;
  }

  private get bValue(): Value {
    if (this.b >> 8 === isReg)
      return this.vm.regs[this.slots + this.b && 0xff]!;
    const constant = this.closure.fragment.constants[this.b && 0xff];
    if (typeof constant == "number") return new Float(constant);
    if (typeof constant == "bigint") return new Integer(constant);
    if (typeof constant == "string") return new String(constant);
    throw new Error("unreachable!");
  }

  private get c(): number {
    return this.closure.fragment.code[this.pc + 2]!;
  }

  private get cValue(): Value {
    if (this.c >> 8 === isReg)
      return this.vm.regs[this.slots + this.c && 0xff]!;
    const constant = this.closure.fragment.constants[this.c && 0xff];
    if (typeof constant == "number") return new Float(constant);
    if (typeof constant == "bigint") return new Integer(constant);
    if (typeof constant == "string") return new String(constant);
    throw new Error("unreachable!");
  }

  private step() {
    this.pc += 4;
  }

  public execute(): Value {
    for (;;) {}
  }
}

const numBinOps = new Map([
  [Code.add, (v1: Number, v2: Number): Value => v1.add(v2)],
  [Code.sub, (v1: Number, v2: Number): Value => v1.sub(v2)],
  [Code.mul, (v1: Number, v2: Number): Value => v1.mul(v2)],
  [Code.pow, (v1: Number, v2: Number): Value => v1.pow(v2)],
  [Code.div, (v1: Number, v2: Number): Value => v1.div(v2)],
  [Code.idv, (v1: Number, v2: Number): Value => v1.idv(v2)],
  [Code.mod, (v1: Number, v2: Number): Value => v1.mod(v2)],

  [Code.and, (v1: Number, v2: Number): Value => v1.and(v2)],
  [Code.or, (v1: Number, v2: Number): Value => v1.or(v2)],
  [Code.xor, (v1: Number, v2: Number): Value => v1.xor(v2)],

  [Code.lt, (v1: Number, v2: Number): Value => v1.lt(v2)],
  [Code.gt, (v1: Number, v2: Number): Value => v1.gt(v2)],
]);

const numUnOps = new Map([
  [Code.unm, (v1: Number): Value => v1.unm()],
  [Code.unp, (v1: Number): Value => v1.unp()],
  [Code.rev, (v1: Number): Value => v1.rev()],
]);

const opNames = new Map([
  [Code.add, "add"],
  [Code.sub, "sub"],
  [Code.mul, "mul"],
  [Code.pow, "pow"],
  [Code.div, "div"],
  [Code.idv, "idv"],
  [Code.mod, "mod"],

  [Code.and, "and"],
  [Code.or, "or"],
  [Code.xor, "xor"],

  [Code.rev, "rev"],
  [Code.unm, "unm"],
  [Code.unp, "unp"],

  [Code.not, "not"],
  [Code.eq, "eq"],
  [Code.lt, "lt"],
  [Code.gt, "gt"],
]);

const stackMax = 0x40;
const regsMax = stackMax * (0xff - 1);

export default class VirtualMachine {
  public readonly regs: Value[] = new Array(regsMax).fill(new Null());
  public readonly global: Table = new Table();
  private readonly callStack: Frame[] = new Array();
  private readonly tables = {
    boolean: new Table(),
    number: new Table(),
    string: new Table(),
    function: new Table(),
  };

  constructor(args: string[]) {
    this.global.set(new String("__global"), this.global);

    const argsTable = new Table();
    for (let i = 0; i < args.length; i++)
      argsTable.set(new Float(i), new String(args[i]));
    this.global.set(new String("__args"), argsTable);
  }

  public run(source: string) {
    const scanner = new Scanner(source);
    const compiler = new Compiler(scanner);
    const fragment = compiler.compile();
    const closure = new Closure(fragment);

    this.regs[0] = new Null(); // this
    this.call(closure, 0);
  }

  private call(callee: Value, slot: number): Value {
    if (callee.type !== "function")
      throw new RuntimeError(`cannot call '${callee.type}'`);

    if (callee instanceof Native) return callee.data(this);

    if (this.callStack.length == stackMax)
      throw new RuntimeError("stack owerflow");

    const frame = new Frame(callee as Closure, slot, this);
    this.callStack.push(frame);
    const value = frame.execute();
    this.callStack.pop();
    return value;
  }
}

export class RuntimeError extends Error {
  constructor(message: string) {
    super(message);
  }
}
