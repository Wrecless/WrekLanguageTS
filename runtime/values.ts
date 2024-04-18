// Define the possible types of values
export type ValueType = "null" | "number" | "boolean" | "o";

// Interface for runtime values
export interface RuntimeVal {
  type: ValueType; // Type of the value
}

// Defines a value of undefined meaning
export interface NullVal extends RuntimeVal {
  type: "null"; // Type of the value
  value: null; // Value of the null
}

// Function to create a null value
export function MK_NULL() {
  return { type: "null", value: null } as NullVal; // Return a null value
}

// Interface for boolean values
export interface BooleanVal extends RuntimeVal {
  type: "boolean"; // Type of the value
  value: boolean; // Value of the boolean
}

// Function to create a boolean value
export function MK_BOOL(b = true) {
  return { type: "boolean", value: b } as BooleanVal; // Return a boolean value
}

// Interface for number values
export interface NumberVal extends RuntimeVal {
  type: "number"; // Type of the value
  value: number; // Value of the number
}

// Function to create a number value
export function MK_NUMBER(n = 0) {
  return { type: "number", value: n } as NumberVal; // Return a number value
}
