export {}

declare global {
  interface String {
    capitalize(): string
  }
}

String.prototype.capitalize = function capitalize(this: string): string {
  return this[0].toUpperCase() + this.substring(1)
}