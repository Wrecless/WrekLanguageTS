// ---------------          LEXER          -------------------

// Define token types for language parsing.
export enum TokenType {
  // Represent literal values.
  // Null,
  Number,
  Identifier,
  String,

  // Define language keywords.
  Let,
  Const,
  Fn,

  // Specify syntax for operations and grouping.
  BinaryOperator, // "+", "-", "*", "/", "%"
  Equals, // "="
  Comma, // ","
  Dot, // "."
  Colon, // ":"
  Semicolon, // ";"
  OpenParen, // "("
  CloseParen, // ")"
  OpenBrace, // "{"
  CloseBrace, // "}"
  OpenBracket, // "["
  CloseBracket, // "]"
  EOF, // End of file.
}

// Map keywords to their corresponding token types.
const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  fn: TokenType.Fn,
};

// Represent a lexical token in the source code.
export interface Token {
  value: string; // Store the exact text of the token.
  type: TokenType; // Categorize the token.
}

// Create a new token with specified value and type.
function token(value = "", type: TokenType): Token {
  return { value, type };
}

// Check if a character is an alphabetic letter.
function isAlphabetical(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

// Determine if a character should be ignored in parsing.
function isSkippable(str: string) {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

// Verify if a character is a digit.
function isDigit(str: string) {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

// Convert source code into a sequence of tokens.
export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  let i = 0;
  const length = sourceCode.length;

  while (i < length) {
    const char = sourceCode[i];

    if (isSkippable(char)) {
      i++; // Ignore whitespace
      continue;
    }

    if (char === '"' || char === "'") { // String literals
      const start = i;
      i++; // skip the opening quote
      let stringContent = "";

      while (i < length && sourceCode[i] !== char) {
        if (sourceCode[i] === "\\" && i + 1 < length) { // Handle escape characters
          i++;
          stringContent += sourceCode[i];
        } else {
          stringContent += sourceCode[i];
        }
        i++;
      }

      if (i >= length) {
        throw new Error(`Unterminated string literal starting at ${start}`);
      }

      i++; // skip the closing quote
      tokens.push(token(stringContent, TokenType.String));
      continue;
    }

    if (isDigit(char) || (char === "." && isDigit(sourceCode[i + 1]))) { // Numeric literals
      let num = "";
      while (i < length && (isDigit(sourceCode[i]) || sourceCode[i] === ".")) {
        num += sourceCode[i];
        i++;
      }
      tokens.push(token(num, TokenType.Number));
      continue;
    }

    if (isAlphabetical(char)) { // Identifiers or keywords
      let ident = "";
      while (i < length && isAlphabetical(sourceCode[i])) {
        ident += sourceCode[i];
        i++;
      }
      const type = KEYWORDS[ident] || TokenType.Identifier;
      tokens.push(token(ident, type));
      continue;
    }

    // Operators and single-character tokens
    switch (char) {
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
        // Handle potential double unary operators like "--"
        if ((char === "+" || char === "-") && sourceCode[i + 1] === char) {
          tokens.push(token("+", TokenType.BinaryOperator));
          i += 2; // Skip both characters
        } else {
          tokens.push(token(char, TokenType.BinaryOperator));
          i++;
        }
        break;
      case "=":
      case ",":
      case ".":
      case ":":
      case ";":
      case "(":
      case ")":
      case "{":
      case "}":
      case "[":
      case "]":
        tokens.push(token(char, TokenType[char as keyof typeof TokenType]));
        i++;
        break;
      default:
        throw new Error(`Unrecognized character: ${char} at position ${i}`);
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}
