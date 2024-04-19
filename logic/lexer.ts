// ---------------          LEXER          -------------------

// Define token types for language parsing.
export enum TokenType {
  // Represent literal values.
  // Null,
  Number,
  Identifier,

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
  OpenBrace,// "{"
  CloseBrace,// "}"
  OpenBracket,// "["
  CloseBracket,// "]"
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
function isDigit (str: string) {
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
    } 
    else if (src[0] == ")") {
      tokens.push(token(src.shift()!, TokenType.CloseParen));
    } 
    else if (src[0] == "{") {
      tokens.push(token(src.shift()!, TokenType.OpenBrace));
    } 
    else if (src[0] == "}") {
      tokens.push(token(src.shift()!, TokenType.CloseBrace));
    }
    else if (src[0] == "[") {
      tokens.push(token(src.shift()!, TokenType.OpenBracket));
    } 
    else if (src[0] == "]") {
      tokens.push(token(src.shift()!, TokenType.CloseBracket));
    }
    
    else if (
      src[0] == "+" || 
      src[0] == "-" || 
      src[0] == "*" || 
      src[0] == "/" ||
      src[0] == "%"
    ) {
      // Handle basic arithmetic operators.
      tokens.push(token(src.shift()!, TokenType.BinaryOperator));
    } 
    else if (src[0] == "=") {
      // Handle assignment operator.
      tokens.push(token(src.shift()!, TokenType.Equals));
    } 
    else if (src[0] == ";") {
      // Handle assignment operator.
      tokens.push(token(src.shift()!, TokenType.Semicolon));
    }
    else if (src[0] == ":") {
      // Handle assignment operator.
      tokens.push(token(src.shift()!, TokenType.Colon));
    } 
    else if (src[0] == ",") {
      // Handle assignment operator.
      tokens.push(token(src.shift()!, TokenType.Comma));
    }
    else if (src[0] == ".") {
      // Handle assignment operator.
      tokens.push(token(src.shift()!, TokenType.Dot));
    }  
    
    else if (isDigit(src[0])) {
      // Accumulate numeric literals.
      let num = "";
      let hasDecimalPoint = false;
      while (src.length > 0 && (isDigit(src[0]) || (!hasDecimalPoint && src[0] === '.'))) {
        if (src[0] === '.') {
          if (num.length === 0) { // Handle .5 as 0.5
            num += '0';
          }
          hasDecimalPoint = true;
        }
        num += src.shift();
      }
      // Push the token as a Number; you might consider distinguishing types further if needed.
      tokens.push(token(num, TokenType.Number));
    }
    
    else if (isAlphabetical(src[0])) {
      // Build identifiers or keywords.
      let ident = "";
      while (src.length > 0 && isAlphabetical(src[0])) {
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
    } 
    else if (isSkippable(src[0])) {
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
