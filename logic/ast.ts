// AST (Abstract Syntax Tree)

// AST explorer: https://astexplorer.net/

// Define the types of nodes that can exist in the AST.
export type NodeType =
  | "Program" // The whole program.
  | "NumericLiteral" // A number.
  | "Identifier" // A name for a variable or symbol.
  | "BinaryExpr"; // An operation involving two operands.

// Define the structure for statements in the AST.
export interface Stmt {
  kind: NodeType; // Used to differentiate node types.
}

// Define the program node, which is the root of the AST.
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[]; // Holds the list of statements in the program.
}

// Define the base structure for expressions in the AST.
export interface Expr extends Stmt {}

// Define a binary expression, which includes operations like addition or subtraction.
export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr; // The expression on the left side of the operator.
  right: Expr; // The expression on the right side of the operator.
  operator: string; // The operation to be performed.
}

// Define an identifier, representing a variable or symbol name in the code.
export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string; // The name of the identifier.
}

// Define a numeric literal, representing a number in the code.
export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number; // The numeric value.
}