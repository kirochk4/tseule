import { coverString, shortString } from "./lib.ts";

export class Token {
    constructor(
        public readonly type: TokenType,
        public readonly literal: string,
        public readonly line: number,
    ) {}

    public toString(): string {
        return `[ token ${this.type.padEnd(10)} |${coverString(
            shortString(this.literal, 8, true),
            10,
        )}| at line ${this.line} ]`;
    }
}

export enum TokenType {
    null = "null",
    true = "true",
    false = "false",

    integer = "integer",
    float = "float",
    string = "string",
    identifier = "identifier",

    variable = "variable",
    constant = "constant",
    syncFunction = "sync function",
    asyncFunction = "async function",

    if = "if",
    else = "else",
    while = "while",
    do = "do",
    for = "for",
    in = "in",
    try = "try",
    catch = "catch",
    finally = "finally",
    throw = "throw",
    yield = "yield",
    return = "return",
    continue = "continue",
    break = "break",
    switch = "switch",
    case = "case",
    default = "default",
    await = "await",

    typeof = "typeof",

    leftParen = "(",
    rightParen = ")",
    leftBrace = "{",
    rightBrace = "}",
    leftBracket = "[",
    rightBracket = "]",
    leftAngle = "<",
    rightAngle = ">",
    leftAngleAngle = "<<",
    rightAngleAngle = ">>",

    semicolon = ";",
    colon = ":",
    dot = ".",
    comma = ",",
    quest = "?",
    equal = "=",
    excl = "!",
    plus = "+",
    minus = "-",
    star = "*",
    slash = "/",
    percent = "%",
    pipe = "|",
    amper = "&",
    circum = "^",
    tilde = "~",

    arrow = "=>",
    questDot = "?.",
    questLeftBracket = "?[",
    equalEqual = "==",
    exclEqual = "!=",
    leftAngleEqual = "<=",
    rightAngleEqual = ">=",
    plusPlus = "++",
    minusMinus = "--",
    plusEqual = "+=",
    minusEqual = "-=",
    starEqual = "*=",
    slashEqual = "/=",
    percentEqual = "%=",
    pipeEqual = "|=",
    amperEqual = "&=",
    circumEqual = "^=",
    tildeEqual = "~=",
    starStar = "**",
    tildeSlash = "~/",
    pipePipe = "||",
    amperAmper = "&&",

    dotDotDot = "...",
    tildeSlashEqual = "~/=",
    starStarEqual = "**=",

    newLine = "new line",

    error = "error",
    eof = "eof",
}
