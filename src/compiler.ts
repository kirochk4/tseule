import Fragment from "./fragment.ts";
import Scanner from "./scanner.ts";

export default class Compiler {
    private readonly fragment = new Fragment();

    constructor(private readonly scanner: Scanner) {}

    public compile(): Fragment {
        return this.fragment;
    }
}
