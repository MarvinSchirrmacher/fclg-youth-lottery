import { MatSnackBarConfig } from "@angular/material/snack-bar";

export var snackBarConfig = {
  duration: 5000,
  verticalPosition: 'bottom',
  panelClass: ['mat-primary'],
} as MatSnackBarConfig; 

export function addUniqueOnly<Type>(types: Type[], type: Type): Type[] {
  if (!types.includes(type))
    types.push(type)
  return types
}

export function ascending(a: number, b: number): number {
  return a - b
}

export function descending(a: number, b: number): number {
  return b - a
}