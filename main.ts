import Parser from "./logic/parser.ts";
import Environment from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MK_BOOL, MK_NULL, MK_NUMBER } from "./runtime/values.ts";
import { NumberVal } from "./runtime/values.ts";

runProgram();

function runProgram() {
  const parser = new Parser(); // Create a new parser instance
  const env = new Environment(); // Create a new environment instance

  // DEBUG: Declare some variables in the environment
  env.declareVar("x", { value: 10, type: "number" } as NumberVal); // test

  env.declareVar("y", MK_NUMBER(20));
  env.declareVar("true", MK_BOOL(true));
  env.declareVar("false", MK_BOOL(false));
  env.declareVar("null", MK_NULL());

  // Print the welcome message
  console.log("\n Wrek prgraming language v0.1");

  while (true) {
    const input = prompt("Wrek > ");
    //check if the user wants to exit
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    // Parse the input and produce the AST
    const program = parser.produceAST(input);
    // console.log(program);

    // Evaluate the AST and produce the result
    const result = evaluate(program, env);
    console.log(result);
  }
}
