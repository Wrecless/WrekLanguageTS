import { NullVal, NumberVal, RuntimeVal } from "./values.ts";
import { BinaryExpr, NumericLiteral, Program, Stmt } from "../logic/ast.ts";

// Function to evaluate a program by iterating over its statements and returning the last evaluated value.
function eval_program(program: Program): RuntimeVal {
  let lastEvaluated: RuntimeVal = { type: "null", value: "null" } as NullVal;
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement); // Evaluate each statement in the program
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
function eval_binary_expr(binop: BinaryExpr): RuntimeVal {
  const lhs = evaluate(binop.left); // Evaluate the left-hand side expression
  const rhs = evaluate(binop.right); // Evaluate the right-hand side expression

  // Only currently support numeric operations
  if (lhs.type == "number" && rhs.type == "number") { // Check if both sides are numbers
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator, // Evaluate the binary operation for numeric values
    );
  }

  // One or both are NULL
  return { type: "null", value: "null" } as NullVal; // Return NULL if one or both sides are not numbers
}

// Function to evaluate AST nodes.
export function evaluate(astNode: Stmt): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: ((astNode as NumericLiteral).value),
        type: "number",
      } as NumberVal; // Return NumberVal for NumericLiteral
    case "NullLiteral":
      return { value: "null", type: "null" } as NullVal; // Return NullVal for NullLiteral
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr); // Evaluate binary expressions
    case "Program":
      return eval_program(astNode as Program); // Evaluate programs
    default:
      console.error(
        "This AST Node has not yet been set up for interpretation.", // Error message for unimplemented AST nodes
        astNode,
      );
      Deno.exit(0); // Exit the program if encountered unimplemented AST node
  }
}
