import { MK_NULL, NumberVal, RuntimeVal } from "./values.ts";
import {
  BinaryExpr,
  Identifier,
  NumericLiteral,
  Program,
  Stmt,
} from "../logic/ast.ts";
import Environment from "./environment.ts";

// Function to evaluate a program by iterating over its statements and returning the last evaluated value.
function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL(); // Initialize the last evaluated value to NULL
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env); // Evaluate each statement in the program
  }
  return lastEvaluated; // Return the last evaluated value
}

// Function to evaluate pure numeric operations with binary operators.
function eval_numeric_binary_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string,
): NumberVal {
  let result: number;
  if (operator == "+") {
    result = lhs.value + rhs.value; // Addition
  } else if (operator == "-") {
    result = lhs.value - rhs.value; // Subtraction
  } else if (operator == "*") {
    result = lhs.value * rhs.value; // Multiplication
  } else if (operator == "/") {
    // TODO: Division by zero checks
    result = lhs.value / rhs.value; // Division
  } else {
    result = lhs.value % rhs.value; // Modulo
  }

  return { value: result, type: "number" }; // Return the result as a NumberVal object
}

// Function to evaluate expressions following the binary operation type.
function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
  const lhs = evaluate(binop.left, env); // Evaluate the left-hand side expression
  const rhs = evaluate(binop.right, env); // Evaluate the right-hand side expression

  // Only currently support numeric operations
  if (lhs.type == "number" && rhs.type == "number") { // Check if both sides are numbers
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator, // Evaluate the binary operation for numeric values
    );
  }

  // One or both are NULL
  return MK_NULL();
}

function eval_identifier(ident: Identifier, env: Environment): RuntimeVal {
  const val = env.lookupVar(ident.symbol); // Lookup the value of the identifier in the environment
  return val; // Return the value of the identifier from the environment
}

// Function to evaluate AST nodes.
export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: ((astNode as NumericLiteral).value),
        type: "number",
      } as NumberVal;
    // case "NullLiteral":
    // return MK_NULL(); // Return NullVal for NullLiteral
     // Return NumberVal for NumericLiteral
    case "Identifier":
      return eval_identifier(astNode as Identifier, env); // Evaluate identifiers
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env); // Evaluate binary expressions
    case "Program":
      return eval_program(astNode as Program, env); // Evaluate programs
    default:
      console.error(
        "This AST Node has not yet been set up for interpretation.", // Error message for unimplemented AST nodes
        astNode,
      );
      Deno.exit(0); // Exit the program if encountered unimplemented AST node
  }
}
