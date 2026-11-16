export type SurfaceFunction = (x: number, y: number, amplitude: number, frequency: number) => number;

type Evaluator = (x: number, y: number) => number;

const functions: Record<string, (value: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, sqrt: Math.sqrt, abs: Math.abs,
  exp: Math.exp, log: Math.log, ln: Math.log, asin: Math.asin, acos: Math.acos, atan: Math.atan,
};

export function compileSurfaceExpression(source: string): SurfaceFunction {
  const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-zA-Z_]\w*|[()+\-*/^,]/gi);
  if (!tokens?.length) throw new Error("Enter a function using x and y.");
  const compact = source.replace(/\s+/g, "");
  if (tokens.join("") !== compact) throw new Error("Unsupported character in expression.");

  let cursor = 0;
  const peek = () => tokens[cursor];
  const take = () => tokens[cursor++];

  const expression = (): Evaluator => {
    let left = term();
    while (peek() === "+" || peek() === "-") {
      const operator = take();
      const right = term();
      const previous = left;
      left = operator === "+"
        ? (x, y) => previous(x, y) + right(x, y)
        : (x, y) => previous(x, y) - right(x, y);
    }
    return left;
  };

  const term = (): Evaluator => {
    let left = unary();
    while (peek() === "*" || peek() === "/") {
      const operator = take();
      const right = unary();
      const previous = left;
      left = operator === "*"
        ? (x, y) => previous(x, y) * right(x, y)
        : (x, y) => previous(x, y) / right(x, y);
    }
    return left;
  };

  const unary = (): Evaluator => {
    if (peek() === "+") { take(); return unary(); }
    if (peek() === "-") { take(); const value = unary(); return (x, y) => -value(x, y); }
    return power();
  };

  const power = (): Evaluator => {
    const base = primary();
    if (peek() === "^") {
      take();
      const exponent = unary();
      return (x, y) => Math.pow(base(x, y), exponent(x, y));
    }
    return base;
  };

  const primary = (): Evaluator => {
    const token = take();
    if (!token) throw new Error("Unexpected end of expression.");
    if (token === "(") {
      const value = expression();
      if (take() !== ")") throw new Error("Missing closing parenthesis.");
      return value;
    }
    if (/^(?:\d|\.)/.test(token)) {
      const value = Number(token);
      return () => value;
    }
    if (/^[a-zA-Z_]/.test(token)) {
      const name = token.toLowerCase();
      if (peek() === "(") {
        const fn = functions[name];
        if (!fn) throw new Error("Unknown function: " + name);
        take();
        const argument = expression();
        if (take() !== ")") throw new Error("Missing closing parenthesis.");
        return (x, y) => fn(argument(x, y));
      }
      if (name === "x") return (x) => x;
      if (name === "y") return (_x, y) => y;
      if (name === "pi") return () => Math.PI;
      if (name === "e") return () => Math.E;
      throw new Error("Unknown variable: " + name);
    }
    throw new Error("Unexpected token: " + token);
  };

  const evaluator = expression();
  if (cursor !== tokens.length) throw new Error("Unexpected token: " + tokens[cursor]);
  return (x, y, amplitude, frequency) => evaluator(x * frequency, y * frequency) * amplitude;
}

export function sampleSurface(
  evaluate: SurfaceFunction,
  amplitude: number,
  frequency: number,
  range = 5,
  segments = 110,
) {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const count = segments + 1;
  const values: number[] = [];

  for (let row = 0; row < count; row++) {
    const y = (row / segments) * range * 2 - range;
    for (let column = 0; column < count; column++) {
      const x = (column / segments) * range * 2 - range;
      let z = evaluate(x, y, amplitude, frequency);
      if (!Number.isFinite(z)) z = 0;
      z = Math.max(-12, Math.min(12, z));
      positions.push(x, z, y);
      values.push(z);
    }
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  for (const value of values) {
    const normalized = (value - min) / span;
    const shade = 0.34 + normalized * 0.5;
    colors.push(shade * 0.78, shade * 0.9, shade);
  }

  for (let row = 0; row < segments; row++) {
    for (let column = 0; column < segments; column++) {
      const a = row * count + column;
      const b = a + count;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, colors, indices };
}
