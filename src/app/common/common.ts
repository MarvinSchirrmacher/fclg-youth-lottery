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

export function empty<T>(list: T[]): boolean {
  return list.length == 0
}

export function contains<T>(list: T[], item: T): boolean {
  const index = list.indexOf(item, 0);
  return index > -1
}

export function remove<T>(list: T[], item: T): void {
  const index = list.indexOf(item, 0);
  if (index > -1) {
    list.splice(index, 1);
  }
}