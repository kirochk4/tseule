# Eule

Simple register-based interpreter for browser and node (deno & bun)

## Types

- null
- boolean
- integer (`8byte safe overflow`)
- float (`8byte float`)
- complex (`16byte`)
- string (`8bit[]`)
- table (`map<string, value | null>`)
- function

## Example

```js
let final sync main() {}

final main() => ...

let a, final b = 1

final async* yieldGet() {
    yield await get()
}

a = sync() => 1
```
