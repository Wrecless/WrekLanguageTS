// -----------------------------------------------------------
// ---------------          LEXER          -------------------
// ---  Responsible for producing tokens from the source   ---
// -----------------------------------------------------------

// Define token types for language parsing.
export enum TokenType {
  // Represent literal values.
  // Null,
  Number,
  Identifier,

  // Define language keywords.
  Let,

  // Specify syntax for operations and grouping.
  BinaryOperator,
  Equals,
  OpenParen,
  CloseParen,
  EOF, // End of file.
}

// Map keywords to their corresponding token types.
const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  // null: TokenType.Null,
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
function isalpha(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

// Determine if a character should be ignored in parsing.
function isskippable(str: string) {
  return str == " " || str == "\n" || str == "\t";
}

// Verify if a character is a digit.
function isint(str: string) {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

// Convert source code into a sequence of tokens.
export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  // Continue until the end of source code is reached.
  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift()!, TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift()!, TokenType.CloseParen));
    } else if (
      src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" ||
      src[0] == "%"
    ) {
      // Handle basic arithmetic operators.
      tokens.push(token(src.shift()!, TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      // Handle assignment operator.
      tokens.push(token(src.shift()!, TokenType.Equals));
    } else if (isint(src[0])) {
      // Accumulate numeric literals.
      let num = "";
      while (src.length > 0 && isint(src[0])) {
        num += src.shift();
      }
      tokens.push(token(num, TokenType.Number));
    } else if (isalpha(src[0])) {
      // Build identifiers or keywords.
      let ident = "";
      while (src.length > 0 && isalpha(src[0])) {
        ident += src.shift();
      }
      const reserved = KEYWORDS[ident];
      if (typeof reserved == "number") {
        // Recognize reserved keywords.
        tokens.push(token(ident, reserved));
      } else {
        // Handle user-defined identifiers.
        tokens.push(token(ident, TokenType.Identifier));
      }
    } else if (isskippable(src[0])) {
      // Ignore whitespace characters.
      src.shift();
    } else {
      // Report unrecognized characters and exit.
      console.error(
        "Unrecognized character found in source: ",
        src[0].charCodeAt(0),
        src[0],
      );
      Deno.exit(1);
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}

// debug

/*
// Example usage: Read source code from a file and tokenize it.
const source = await Deno.readTextFile("./test.txt");
for (const token of tokenize(source)) {
  console.log(token);
}
*/
