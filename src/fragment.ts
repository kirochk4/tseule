import { Code } from "./machine.ts";

export type Constant = number | bigint | string | Fragment;

/*
bytecode format 32 bit | code, a, b, c
code - uint6
a - uint8 (always register)
b & c - uint9 (first bit to encode 'register or constant') 
*/

export default class Fragment {
    public readonly code: number[] = [];
    public readonly lines: number[] = [];
    public readonly constants: Constant[] = [];

    public writeCode(code: Code, line: number) {
        this.code.push(code);
        this.lines.push(line);
    }

    public addConstant(constant: Constant): number {
        for (let i = 0; i < this.constants.length; i++)
            if (this.constants[i] === constant) return i;

        this.constants.push(constant);
        return this.constants.length - 1;
    }
}
