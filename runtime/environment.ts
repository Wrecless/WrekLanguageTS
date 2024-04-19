import { MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, RuntimeVal } from "./values.ts";

export function createGlobalEnv () {
  const env = new Environment(); // Create a new environment instance
  //Create default global environment
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  // Define a native function to print values to the console
  env.declareVar(
    "print", 
    MK_NATIVE_FN((args, scope) => {
      console.log(...args);
      return MK_NULL();
    }), 
    true
  );

  function timeFunction(_args: RuntimeVal[], _env: Environment) {
    return MK_NUMBER(Date.now());
  }
  env.declareVar("time", MK_NATIVE_FN(timeFunction), true);

  return env;
}


// Environment class represents a lexical scope for variables
export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  // Constructor to initialize the environment
  constructor(parentENV?: Environment) {
    // if there parent is not set
    const global = parentENV ? true : false;
    // Initialize the parent environment
    this.parent = parentENV;
    // Initialize the map to store variables
    this.variables = new Map();
    // Initialize the set to store constants
    this.constants = new Set();
  }

  // Method to declare a new variable in the current environment
  public declareVar(
    varname: string,
    value: RuntimeVal,
    constant: boolean,
  ): RuntimeVal {
    // console.log(varname, value); // DEBUG: Print the variable name and value
    // Check if the variable is already declared in the current environment
    if (this.variables.has(varname)) {
      // Throw an error if the variable is already declared
      throw `Cannot declare variable ${varname}. As it already is defined.`;
    }

    // Set the variable and its value in the current environment
    this.variables.set(varname, value);

    if (constant) {
      this.constants.add(varname);
    } // double checks if the variable is constant

    // Return the assigned value
    return value;
  }

  // Method to assign a new value to an existing variable
  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    // Resolve the environment where the variable is declared
    const env = this.resolve(varname);

    // Cannot assign to a constant error
    if (env.constants.has(varname)) {
      throw `Cannot assign variable '${varname}' as it has been declared as a constant.`;
    }
    // Set the variable to the new value in the resolved environment
    env.variables.set(varname, value);
    // Return the assigned value
    return value;
  }

  // Method to lookup the value of a variable
  public lookupVar(varname: string): RuntimeVal {
    // Resolve the environment where the variable is declared
    const env = this.resolve(varname);
    // Return the value of the variable from the resolved environment
    return env.variables.get(varname) as RuntimeVal;
  }

  // Method to resolve the environment where a variable is declared
  public resolve(varname: string): Environment {
    // Check if the variable is declared in the current environment
    if (this.variables.has(varname)) {
      // Return the current environment if the variable is found
      return this;
    }

    // If the variable is not found in the current environment
    // and there is no parent environment, throw an error
    if (this.parent == undefined) {
      throw `Cannot resolve '${varname}' as it does not exist.`;
    }

    // Recursively resolve the variable in the parent environment
    return this.parent.resolve(varname);
  }
}
