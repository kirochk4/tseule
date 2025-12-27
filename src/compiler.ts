import Fragment from "./fragment.ts";
import Scanner from "./scanner.ts";
import { Token, TokenType } from "./token.ts";

export default class Compiler {
  private readonly fragment = new Fragment();
  private current: Token;
  private previous: Token;

  constructor(private readonly scanner: Scanner) {}

  public compile(): Fragment {
    return this.fragment;
  }

  private advance() {
    this.previous = this.current;
    this.current = this.scanner.scan();
    // TODO: error token handling
  }

  private errorAt() {} // TODO

  private consume(type: TokenType, message: string) {
    if (this.current.type === type) this.advance();
    else this.errorAt();
  }

  private consumeSemicolon() {
    if (this.current.type === TokenType.semicolon) this.advance();
    else if (this.current.type === TokenType.newLine) this.advance();
    else this.errorAt();
  }

  private skipNewLine() {
    this.match(TokenType.newLine);
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private check(type: TokenType): boolean {
    return this.current.type === type;
  }
}
