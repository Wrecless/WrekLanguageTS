export type ValueType = "null" | "number";

export interface RuntimeVal {
  type: ValueType; // Type of the runtime value
}

// Defines a value of undefined meaning
export interface NullVal extends RuntimeVal {
  type: "null"; // Type is always "null" for NullVal
  value: "null"; // Value is always "null" for NullVal
}

// Runtime value that has access to the raw native javascript number.
export interface NumberVal extends RuntimeVal {
  type: "number"; // Type is always "number" for NumberVal
  value: number; // Actual numeric value stored
}
