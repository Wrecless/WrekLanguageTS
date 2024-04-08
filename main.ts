import Parser from "./logic/parser.ts";

repl();

function repl() {
  const parser = new Parser();
  console.log("\n Wrek prgraming language v0.1");

  while (true) {
    const input = prompt("Wrek > ");
    //check if the user wants to exit
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.produceAST(input);
    console.log(program);
  }
}
