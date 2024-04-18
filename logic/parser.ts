// ---------------          PARSER          -------------------

// deno-lint-ignore-file no-explicit-any
// Ignore all linting errors.

import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  Identifier,
  MemberExpr,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Property,
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

  // Order of Prescience //

  // AssignmentExpr
  // MemberExpr
  // FunctionCallExpr
  // LogicalExpr
  // ComparisonExpr
  // AdditiveExpr
  // MultiplicativeExpr
  // UnaryExpr
  // PrimaryExpr

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
        throw "Must assign value to constant expression. No value provided.";
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
      "Variable declaration statement must end with semicolon.",
    );

    return declaration;
  }

  // Handle expressions
  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expr { // private because it is only used by parse_expr
    const left = this.parse_object_expr();

    if (this.currentToken().type == TokenType.Equals) {
      this.consumeToken(); // consume equals token and advance to next token
      const value = this.parse_assignment_expr();
      return {
        value,
        assignee: left,
        kind: "AssignmentExpr",
      } as AssignmentExpr;
    }

    return left;
  }

  private parse_object_expr(): Expr {
    // { Prop [] }
    if (this.currentToken().type !== TokenType.OpenBrace) {
      return this.parse_additive_expr();
    }
    this.consumeToken(); // consume the open bracket token and advance to the next token
    const properties = new Array<Property>();

    while (
      this.not_eof() && this.currentToken().type != TokenType.CloseBrace
    ) {
      // { Key : Value, key2 : Value2 }
      const key = this.expect(
        TokenType.Identifier,
        "Expected identifier for object property key.",
      ).value;

      // { Key, } handles the comma in the object expression
      if (this.currentToken().type == TokenType.Comma) {
        this.consumeToken(); // consume the comma token and advance to the next token
        properties.push({ key, kind: "Property" } as Property); // push the key to the properties array
        continue; // so it doesn't stop
      } 
      // detects if closing bracket is reached { Key }
      else if (this.currentToken().type == TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" }); // push the key to the properties array
        continue; // so it doesn't stop
      }

      // { Key : Value }
      this.expect(TokenType.Colon, "Expected colon after object property key.");
      const value = this.parse_expr();

      properties.push({ kind: "Property", value, key });
      if (this.currentToken().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma after object property value.",
        );
      }
    }

    this.expect(
      TokenType.CloseBrace,
      "Expected closing bracket for object expression.",
    );
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  // Handle Addition & Subtraction Operations
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicative_expr();

    while (
      this.currentToken().value == "+" || this.currentToken().value == "-"
    ) {
      const operator = this.consumeToken().value;
      const right = this.parse_multiplicative_expr();
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
  private parse_multiplicative_expr(): Expr {
    let left = this.parse_call_member_expr();

    while (
      this.currentToken().value == "/" ||
      this.currentToken().value == "*" ||
      this.currentToken().value == "%"
    ) {
      const operator = this.consumeToken().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // foo.x ()
  private parse_call_member_expr(): Expr {
    const member = this.parse_member_expr();

    if (this.currentToken().type == TokenType.OpenParen) {
      return this.parse_call_expr(member);
    }

    return member;
  }

  private parse_call_expr(caller: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;

    if (this.currentToken().type == TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }

    return call_expr;
  }

  private parse_args(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis");
    const args = this.currentToken().type == TokenType.CloseParen
      ? []
      : this.parse_arguments_list();

    this.expect(
      TokenType.CloseParen,
      "Missing closing parenthesis",
    );
    return args;
  }

  // f(x = 5, v = "hello")
  private parse_arguments_list(): Expr[] {
    const args = [this.parse_assignment_expr()];

    while (this.currentToken().type == TokenType.Comma && this.consumeToken()) {
      args.push(this.parse_assignment_expr());
    }

    return args;
  }

  private parse_member_expr(): Expr {
    let object = this.parse_primary_expr();

    while (
      this.currentToken().type == TokenType.Dot || this.currentToken().type == TokenType.OpenBracket
    ) 
    {
      const operator = this.consumeToken();
      let property: Expr;
      let computed: boolean;

      // non-computed values aka obj.expr
      if (operator.type == TokenType.Dot) {
        computed = false;
        // get identifier
        property = this.parse_primary_expr();
        if (property.kind != "Identifier") 
        {
          throw `Can not use dot without right being a identifier`;
        }
      } 
      else { // this allows obj[computedValue]
        computed = true;
        property = this.parse_expr();
        this.expect(
          TokenType.CloseBracket,
          "Missing closing bracket.",
        );
      }

      object = {
        kind: "MemberExpr",
        object,
        property,
        computed,
      } as MemberExpr;
    }

    return object;
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
          "Unexpected token found inside parenthesis expression. Expected closing parenthesis.",
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
