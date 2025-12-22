export function code(symbol: string): number {
    const code = symbol.codePointAt(0);
    if (code === undefined) throw new Error("TODO");
    return code;
}

export function slice(str: string, start: number, end: number): string {
    return [...str].slice(start, end).join("");
}

export function length(str: string): number {
    return [...str].length;
}

export function short(
    str: string,
    length: number,
    cutNewLine: boolean = false,
): string {
    const chars = [...str];

    const cut = (index: number): string => {
        return chars.slice(0, index).join("");
    };

    if (cutNewLine) {
        let newLineIndex = chars.indexOf("\r");
        if (newLineIndex < 0) newLineIndex = chars.indexOf("\n");
        if (newLineIndex >= 0 && newLineIndex < length)
            return cut(newLineIndex);
    }

    if (length >= chars.length) return str;

    return cut(length);
}

export function cover(str: string, width?: number, char: string = " "): string {
    if (width === undefined) width = length(str) + 2;
    if (length(str) > width) str = short(str, width);
    const left = (width - length(str)) / 2;
    const right = left + (length(str) % 2);
    return `${char.repeat(left)}${str}${char.repeat(right)}`;
}
