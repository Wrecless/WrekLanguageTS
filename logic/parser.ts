// ---------------          PARSER          -------------------

// deno-lint-ignore-file no-explicit-any
// Ignore all linting errors.

import {
  BinaryExpr,
  Expr,
  Identifier,
  NumericLiteral,
  Program,
  Stmt,
  VarDeclaration,
} from "./ast.ts";

import { Token, tokenize, TokenType } from "./lexer.ts";

// Frontend for producing a valid AST from source code
export default class Parser {
  private tokens: Token[] = [];

  // Determines if the parsing is complete and the END OF FILE Is reached.
  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  // Returns the currently available token
  private currentToken() {
    return this.tokens[0] as Token;
  }

  // Removes the current token from the token stream and advances the parser to the next token.
  private consumeToken() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  // Returns the previous token and then advances the tokens array to the next value.
  // Also checks the type of expected token and throws if the values don't match.
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      Deno.exit(1);
    }

    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parse until end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  // Handle complex statement types
  private parse_stmt(): Stmt { // parse statement
    switch (this.currentToken().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr();
    }
  }
  // LET IDENT;
  // ( LET | CONST ) IDENT = EXPR;
  parse_var_declaration(): Stmt {
    const isConstant = this.consumeToken().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords.",
    ).value;

    if (this.currentToken().type == TokenType.Semicolon) {
      this.consumeToken(); // expect semicolon
      if (isConstant) {
        throw "Must assigne value to constant expression. No value provided.";
      }

      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration.",
    );

    const declaration = {
      kind: "VarDeclaration",
      value: this.parse_expr(),
      identifier,
      constant: isConstant,
    } as VarDeclaration;

    this.expect(
      TokenType.Semicolon,
      "Variable declaration statment must end with semicolon.",
    );

    return declaration;
  }
  // Handle expressions
  private parse_expr(): Expr {
    return this.parse_additive_expr();
  }

  // Order of Prescience

  // AssignmentExpr
  // MemberExpr
  // FunctionCallExpr
  // LogicalExpr
  // ComparisonExpr
  // AdditiveExpr
  // MultiplicitaveExpr
  // UnaryExpr
  // PrimaryExpr

  // Handle Addition & Subtraction Operations
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while (
      this.currentToken().value == "+" || this.currentToken().value == "-"
    ) {
      const operator = this.consumeToken().value;
      const right = this.parse_multiplicitave_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Handle Multiplication, Division & Modulo Operations
  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_primary_expr();

    while (
      this.currentToken().value == "/" || this.currentToken().value == "*" ||
      this.currentToken().value == "%"
    ) {
      const operator = this.consumeToken().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Parse Literal Values & Grouping Expressions
  private parse_primary_expr(): Expr {
    const tk = this.currentToken().type;

    // Determine which token we are currently at and return literal value
    switch (tk) {
      // User defined values.
      case TokenType.Identifier:
        return {
          kind: "Identifier",
          symbol: this.consumeToken().value,
        } as Identifier;

      // case TokenType.Null:
      //   this.consumeToken(); // consume the null token and advance to the next token
      //   return {
      //     kind: "NullLiteral",
      //     value: null,
      //   } as NullLiteral;

      // Constants and Numeric Constants
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.consumeToken().value),
        } as NumericLiteral;

      // Grouping Expressions
      case TokenType.OpenParen: {
        this.consumeToken(); // consumeToken the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
        ); // closing paren
        return value;
      }

      // Unidentified Tokens and Invalid Code Reached
      default:
        console.error(
          "Unexpected token found during parsing!",
          this.currentToken(),
        );
        Deno.exit(1);
    }
  }
}
