import { Code } from "./machine.ts";

export type Constant = number | string | Fragment;

export default class Fragment {
    public readonly code: number[] = [];
    public readonly lines: number[] = [];
    public readonly constants: Constant[] = [];
    public upvalueCount: number = 0;

    public writeCode(code: Code, line: number) {
        this.code.push(code);
        this.lines.push(line);
    }

    public writeConstant(constant: Constant): number {
        for (let i = 0; i < this.constants.length; i++)
            if (this.constants[i] === constant) return i;

        this.constants.push(constant);
        return this.constants.length - 1;
    }
}
