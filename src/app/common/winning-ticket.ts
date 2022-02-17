export class WinningTicket {

  private static regexp = new RegExp(/^L(?<list>\d+)N(?<number>\d+)$/gm)

  public list: number = 0;
  public number: number = 0;

  constructor(list: number, number: number) {
    this.list = list;
    this.number = number;
  }

  public equals(other: WinningTicket): boolean {
    return other.list === this.list && other.number === this.number;
  }

  public compareTo(other: WinningTicket): number {
    if (this.list > other.list) return 1
    if (this.list < other.list) return -1
    
    if (this.number > other.number) return 1
    if (this.number < other.number) return -1
    
    return 0
  } 

  public toString = (): string => {
    return `L${this.list}N${this.number}`;
  }

  public static fromString(string: string): WinningTicket {
    var exec = this.regexp.exec(string);
    if (exec?.groups === undefined)
      throw new Error(`value "${string}" does not match ticket pattern L<list>N<number>`);

    return new WinningTicket(
      parseInt(exec?.groups['list']),
      parseInt(exec?.groups['number'])
    );
  }

  public static fromObject(ticket: WinningTicket): WinningTicket {
    return new WinningTicket(ticket.list, ticket.number)
  }
}