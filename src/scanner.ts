import { code, length, slice } from "./lib.ts";
import { Token, TokenType } from "./token.ts";

export default class Scanner {
    private sourceCounter: number = 0;
    private start: number = 0;
    private line: number = 1;
    private insertNewLine: boolean = false;

    constructor(private readonly source: string) {}

    public reset() {
        this.sourceCounter = 0;
        this.start = 0;
        this.line = 1;
        this.insertNewLine = false;
    }

    public scan(): Token {
        try {
            const line = this.line;

            this.skipWhitespacesAndComments();

            this.start = this.sourceCounter;

            if (this.insertNewLine && line < this.line)
                return this.makeToken(TokenType.newLine);

            if (this.isAtEnd) return this.makeToken(TokenType.eof);

            const char = this.advance();

            if (isAlpha(char)) return this.identifier();

            if (isDigit(char)) return this.number(char);

            if (char == codeQuot) return this.string();

            let trio;
            if (
                (trio = triple.get(
                    String.fromCodePoint(char, this.current, this.peek),
                ))
            ) {
                this.advance();
                this.advance();
                return this.makeToken(trio);
            }

            let duo;
            if ((duo = dual.get(String.fromCodePoint(char, this.current)))) {
                this.advance();
                return this.makeToken(duo);
            }

            let solo;
            if ((solo = mono.get(String.fromCodePoint(char))))
                return this.makeToken(solo);

            this.throwErrorToken("unexpected symbol");
        } catch (error) {
            if (error instanceof Token) return error;
            throw error;
        }
    }

    private advance(): number {
        const char = this.current;
        this.sourceCounter++;
        return char;
    }

    private makeToken(type: TokenType): Token {
        this.insertNewLine = allowNewLineAfter.has(type);
        const literal = this.literal;
        const line = this.line;
        return new Token(type, literal, line);
    }

    private throwErrorToken(message: string): never {
        this.insertNewLine = true;
        throw new Token(TokenType.error, message, this.line);
    }

    private skipWhitespacesAndComments() {
        for (;;) {
            switch (this.current) {
                case codeNewLine:
                    this.line++;
                /* falls through */
                case codeSpace:
                case codeTab:
                case codeReturn:
                    this.advance();
                    break;
                case codeSlash:
                    if (this.peek === codeSlash) {
                        this.advance();
                        this.advance();
                        this.skipComment();
                    } else if (this.peek === codeStar) {
                        this.advance();
                        this.advance();
                        this.skipLongComment();
                    } else return;
                    break;
                default:
                    return;
            }
        }
    }

    private skipComment() {
        while (this.current !== codeNewLine && !this.isAtEnd) this.advance();
    }

    private skipLongComment() {
        while (!(this.current === codeStar && this.peek === codeSlash)) {
            if (this.isAtEnd) this.throwErrorToken("unfinished long comment");
            if (this.advance() == codeNewLine) this.line++;
        }

        this.advance();
        this.advance();
    }

    private identifier(): Token {
        while (isAlpha(this.current) || isDigit(this.current)) this.advance();
        return this.makeToken(
            keywords.get(this.literal) || TokenType.identifier,
        );
    }

    private string(): Token {
        let previous = -1;
        while (!(this.current === codeQuot && previous !== codeBackSlash))
            if (this.isAtEnd || this.current === codeNewLine)
                this.throwErrorToken("unfinished string");
            else previous = this.advance();
        this.advance();
        return this.makeToken(TokenType.string);
    }

    private number(previous: number): Token {
        let base: number;
        if (previous === code0 && numberBase.has(this.current)) {
            base = numberBase.get(this.advance())!;
            if (!isDigit(this.current, base))
                this.throwErrorToken("malformed number");
        } else base = 10;

        const readDigits = (allowUnderscore: boolean) => {
            while (
                isDigit(this.current, base) ||
                (allowUnderscore && this.current === codeUnderscore)
            ) {
                allowUnderscore = this.current !== codeUnderscore;
                this.advance();
            }
            if (
                !allowUnderscore ||
                isAlpha(this.current) ||
                isDigit(this.current)
            )
                this.throwErrorToken("malformed number");
        };

        readDigits(true);

        if (base === 10 && this.current == codeDot && isDigit(this.peek)) {
            this.advance();
            readDigits(false);
        }

        return this.makeToken(TokenType.number);
    }

    private get isAtEnd(): boolean {
        return this.current == eof;
    }

    private get current(): number {
        if (this.sourceCounter >= length(this.source)) return eof;
        return code(this.source[this.sourceCounter]!);
    }

    private get peek(): number {
        if (this.sourceCounter + 1 >= length(this.source)) return eof;
        return code(this.source[this.sourceCounter + 1]!);
    }

    private get literal(): string {
        return slice(this.source, this.start, this.sourceCounter);
    }
}

const numberBase = new Map([
    [code("x"), 16],
    [code("o"), 8],
    [code("b"), 2],

    [code("X"), 16],
    [code("O"), 8],
    [code("B"), 2],
]);

const mono = new Map<string, TokenType>([
    ["(", TokenType.leftParen],
    [")", TokenType.rightParen],
    ["{", TokenType.leftBrace],
    ["}", TokenType.rightBrace],
    ["[", TokenType.leftBracket],
    ["]", TokenType.rightBracket],
    ["<", TokenType.leftAngle],
    [">", TokenType.rightAngle],

    [";", TokenType.semicolon],
    [":", TokenType.colon],
    [".", TokenType.dot],
    [",", TokenType.comma],
    ["?", TokenType.quest],
    ["=", TokenType.equal],
    ["!", TokenType.excl],
    ["+", TokenType.plus],
    ["-", TokenType.minus],
    ["*", TokenType.star],
    ["/", TokenType.slash],
    ["%", TokenType.percent],
    ["|", TokenType.pipe],
    ["&", TokenType.amper],
    ["^", TokenType.circum],
    ["~", TokenType.tilde],
]);

const dual = new Map<string, TokenType>([
    ["<<", TokenType.leftAngleAngle],
    [">>", TokenType.rightAngleAngle],

    ["?.", TokenType.questDot],
    ["?[", TokenType.questLeftBracket],
    ["==", TokenType.equalEqual],
    ["!=", TokenType.exclEqual],
    ["<=", TokenType.leftAngleEqual],
    [">=", TokenType.rightAngleEqual],
    ["++", TokenType.plusPlus],
    ["--", TokenType.minusMinus],
    ["+=", TokenType.plusEqual],
    ["-=", TokenType.minusEqual],
    ["*=", TokenType.starEqual],
    ["/=", TokenType.slashEqual],
    ["%=", TokenType.percentEqual],
    ["|=", TokenType.pipeEqual],
    ["&=", TokenType.amperEqual],
    ["^=", TokenType.circumEqual],
    ["~=", TokenType.tildeEqual],
    ["**", TokenType.starStar],
    ["~/", TokenType.tildeSlash],
    ["||", TokenType.pipePipe],
    ["&&", TokenType.amperAmper],
]);

const triple = new Map<string, TokenType>([["...", TokenType.dotDotDot]]);

const keywords = new Map<string, TokenType>([
    ["null", TokenType.null],
    ["true", TokenType.true],
    ["false", TokenType.false],

    ["let", TokenType.variable],
    ["function", TokenType.function],

    ["if", TokenType.if],
    ["else", TokenType.else],
    ["while", TokenType.while],
    ["do", TokenType.do],
    ["for", TokenType.for],
    ["in", TokenType.in],
    ["try", TokenType.try],
    ["catch", TokenType.catch],
    ["finally", TokenType.finally],
    ["throw", TokenType.throw],
    ["yield", TokenType.yield],
    ["return", TokenType.return],
    ["continue", TokenType.continue],
    ["break", TokenType.break],
    ["switch", TokenType.switch],
    ["case", TokenType.case],
    ["default", TokenType.default],

    ["typeof", TokenType.typeof],
]);

const allowNewLineAfter = new Set<TokenType>([
    TokenType.null,
    TokenType.true,
    TokenType.false,
    TokenType.number,
    TokenType.string,
    TokenType.identifier,
    TokenType.return,
    TokenType.continue,
    TokenType.break,
    TokenType.rightParen,
    TokenType.rightBrace,
    TokenType.rightBracket,
    TokenType.plusPlus,
    TokenType.minusMinus,
]);

const eof = -1;

const code0 = code("0");
const code9 = code("9");

const codeALower = code("a");
const codeZLower = code("z");

const codeAUpper = code("A");
const codeZUpper = code("Z");

const codeSpace = code(" ");
const codeUnderscore = code("_");
const codeDot = code(".");
const codeSlash = code("/");
const codeStar = code("*");

const codeBackSlash = code("\\");
const codeQuot = code('"');
const codeNewLine = code("\n");
const codeTab = code("\t");
const codeReturn = code("\r");

function isDigit(char: string, base?: number): boolean;
function isDigit(char: number, base?: number): boolean;
function isDigit(strNumChar: string | number, base: number = 10): boolean {
    let char: number;
    if (typeof strNumChar === "number") char = strNumChar;
    else char = code(strNumChar);

    if (base <= 10) return code0 <= char && char < code0 + base;
    else
        return (
            (code0 <= char && char <= code9) ||
            (codeALower <= char && char < codeALower + base - 10) ||
            (codeAUpper <= char && char < codeAUpper + base - 10)
        );
}

function isAlpha(char: string): boolean;
function isAlpha(char: number): boolean;
function isAlpha(strNumChar: string | number): boolean {
    let char: number;
    if (typeof strNumChar === "number") char = strNumChar;
    else char = code(strNumChar);

    return (
        (codeALower <= char && char <= codeZLower) ||
        (codeAUpper <= char && char <= codeZUpper) ||
        codeUnderscore === char
    );
}
