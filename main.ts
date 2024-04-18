import Parser from "./logic/parser.ts";
import Environment from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MK_BOOL, MK_NULL } from "./runtime/values.ts";


runProgram();

function runProgram() {
  const parser = new Parser(); // Create a new parser instance
  const env = new Environment(); // Create a new environment instance

  // DEBUG: Declare some variables in the environment
  // env.declareVar("true", MK_BOOL(true), true);
  // env.declareVar("false", MK_BOOL(false), true);
  // env.declareVar("null", MK_NULL(), true);

  // Print the welcome message
  console.log("\n Wrek programming language v0.1");

  while (true) {
    const input = prompt("Wrek > ");
    //check if the user wants to exit
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    // Parse the input and produce the AST
    // AST explorer: https://astexplorer.net/
    const program = parser.produceAST(input);
    // console.log(program); // DEBUG: Print the AST

    // Evaluate the AST and prints result
    const result = evaluate(program, env);
    console.log(result);
  }
}
