import { AssignmentExpr, BinaryExpr, Identifier, ObjectLiteral } from "../../logic/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { MK_NULL, NumberVal, ObjectVal, RuntimeVal } from "../values.ts";

function eval_numeric_binary_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string,
): NumberVal {
  let result: number;
  if (operator == "+") {
    result = lhs.value + rhs.value;
  } 
  else if (operator == "-") {
    result = lhs.value - rhs.value;
  } 
  else if (operator == "*") {
    result = lhs.value * rhs.value;
  } 
  else if (operator == "/") {
    // TODO: Division by zero checks
    result = lhs.value / rhs.value;
  } 
  else {
    result = lhs.value % rhs.value;
  }

  return { value: result, type: "number" };
}

// Evaluates expressions following the binary operation type.
export function eval_binary_expr(
  binaryOperation: BinaryExpr,
  env: Environment,
): RuntimeVal {
  const lhs = evaluate(binaryOperation.left, env);
  const rhs = evaluate(binaryOperation.right, env);

  // Only currently support numeric operations
  if (lhs.type == "number" && rhs.type == "number") {
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binaryOperation.operator,
    );
  }

  // One or both are NULL
  return MK_NULL();
}

export function eval_identifier(
  ident: Identifier,
  env: Environment,
): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

export function eval_assignment ( node: AssignmentExpr, env: Environment): RuntimeVal {
  if (node.assignee.kind !== "Identifier") // Check if the assignee is an identifier
    throw `Invalid LHS in assignment expression ${JSON.stringify(node.assignee)}`; // Throw an error if it is not an identifier

    const varname = (node.assignee as Identifier).symbol; // Get the variable name
  return env.assignVar(varname, evaluate(node.value, env)); // Assign the value to the variable
}

export function eval_object_expr(
  obj: ObjectLiteral,
  env: Environment,
): RuntimeVal 
{
  const object = { type: "object", properties: new Map() } as ObjectVal; // Create a new object
  for (const { key, value } of obj.properties) // Iterate over the properties
  { 
    // console.log(key, value);
    const RuntimeVal = (value == undefined) 
    ? env.lookupVar(key) 
    : evaluate(value, env); // Get the value of the property

    object.properties.set(key, RuntimeVal); // Set the property in the object
  }

  return object; // Return the object
}