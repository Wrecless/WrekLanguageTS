import { NumberVal, RuntimeVal } from "./values.ts";
import {
AssignmentExpr,
  BinaryExpr,
  CallExpr,
  FunctionDeclaration,
  Identifier,
  NumericLiteral,
  FloatLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  VarDeclaration,
} from "../logic/ast.ts";
import Environment from "./environment.ts";
import { eval_function_declaration, eval_program, eval_var_declaration } from "./eval/statements.ts";
import { eval_assignment, eval_binary_expr, eval_call_expr, eval_identifier, eval_object_expr } from "./eval/expressions.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
    case "FloatLiteral": // Combine handling for simplicity
      return {
        value: (astNode as NumericLiteral | FloatLiteral).value,
        type: "number",
      } as NumberVal;

    case "Identifier":
      return eval_identifier(astNode as Identifier, env);

    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);

    case "CallExpr":
      return eval_call_expr(astNode as CallExpr, env);

    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env); // let x = 5; // const y = 10;

    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);

    case "Program":
      return eval_program(astNode as Program, env);

    // Handle statements
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);

    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);
      
    // Handle unimplemented ast types as error.
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode,
      );
      Deno.exit(0);
  }
}
