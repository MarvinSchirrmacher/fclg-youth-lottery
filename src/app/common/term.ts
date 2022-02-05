export class Term {
  start: Date;
  end?: Date = undefined;

  constructor(start: Date, end?: Date) {
    this.start = new Date(start)
    if (end) this.end = new Date(end)
  }

  public static fromObject(term: Term): Term {
    return new Term(term.start, term.end)
  }
}