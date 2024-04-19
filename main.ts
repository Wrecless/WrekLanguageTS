import Parser from "./logic/parser.ts";
import Environment, { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

Wrek();
// runProgram("./test.txt");

async function runProgram(filename: string) {
  const parser = new Parser();
  const env = createGlobalEnv();

  const input = await Deno.readTextFile(filename);
  const program = parser.produceAST(input);
  // console.log(program);
  const result = evaluate(program, env);
  console.log(result);
}

function Wrek() {
  const parser = new Parser();
  const env = createGlobalEnv();
  // INITIALIZE Wrek
  console.log("\n Welcome to the Wrek Programming Language\n");

  // Continue Wrek Until User Stops Or Types `exit`
  while (true) {
    const input = prompt("Wrek> ");
    // Check for no user input or exit keyword.
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    // Produce AST From sourc-code
    const program = parser.produceAST(input);
    // console.log(program);

    const result = evaluate(program, env);
    console.log(result);
  }
}

// AST explorer: https://astexplorer.net/
// https://lisperator.net/pltut/
// https://idiocy.org/lets-go-write-a-lisp/part-1.html
