// ---------------          AST (Abstract Syntax Tree)          -------------------

// AST explorer: https://astexplorer.net/

// Define the types of nodes that can exist in the AST.
export type NodeType =
  // STATEMENTS
  | "Program" // The whole program.
  | "VarDeclaration" // A variable declaration.
  | "FunctionDeclaration" // A function declaration.
  // EXPRESSIONS
  | "AssignmentExpr" // Assignment expression.
  | "MemberExpr" // Member expression.
  | "CallExpr" // Function call.

  // LITERALS#
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral" // Numbers.
  | "Identifier" // variable or symbol.
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

export interface VarDeclaration extends Stmt {
  kind: "VarDeclaration";
  constant: boolean; // True if the variable is a constant.
  identifier: string; // The name of the variable.
  value?: Expr; // ? = optional field, meaning the value is not required.
}

export interface FunctionDeclaration extends Stmt {
  kind: "FunctionDeclaration";
  parameters: string[]; // The names of the parameters.
  name: string; // The name of the function.
  body: Stmt[]; // The body of the function.
}

// Define the base structure for expressions in the AST.
export interface Expr extends Stmt {}

// Define an assignment expression, which assigns a value to a variable.
export interface AssignmentExpr extends Expr {
  kind : "AssignmentExpr";
  assignee: Expr; // cant use string here because it needs to support complex expressions
  value: Expr; // The expression to be assigned.
}

// Define a binary expression, which includes operations like addition or subtraction.
export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr; // The expression on the left side of the operator.
  right: Expr; // The expression on the right side of the operator.
  operator: string; // The operation to be performed.
}

export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr; 
  property: Expr;
  computed: boolean; // The operation to be performed.
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

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr; // ? = optional field
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}