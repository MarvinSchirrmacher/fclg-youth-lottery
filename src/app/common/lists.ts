import { contains, empty, remove } from "./common"

export class ListSelection<T> {
  private list: T[] = []

  get(): T[] {
    return this.list
  }

  select(item: T) {
    if (contains(this.list, item))
      remove(this.list, item)
    else
      this.list.push(item)
  }

  deselectAll() {
    this.list = []
  }

  isSelected(item: T) {
    return contains(this.list, item)
  }

  anyIsSelected() {
    return !empty(this.list)
  }
}

export class TaggableList<T> {
  objects: Taggable<T>[]
  equals: (a: T, b: T) => boolean

  constructor(objects: T[], equals: (a: T, b: T) => boolean) {
    this.objects = objects.map(o => new Taggable(o))
    this.equals = equals
  }

  tag(object: T): void {
    this.find(object)?.tag()
  }

  untag(object: T): void {
    this.find(object)?.untag()
  }

  isTagged(object: T): boolean {
    var o = this.find(object)
    return o ? o.tagged : false
  }

  export(): T[] {
    return this.objects.map(o => o.object)
  }

  get length(): number {
    return this.objects.length
  }

  private find(object: T): Taggable<T> | undefined {
    return this.objects.find(o => this.equals(o.object, object))
  }

  static empty<T>(): TaggableList<T> {
    return new TaggableList<T>([], () => false)
  }
}

class Taggable<T> {
  object: T
  private _tagged: boolean = false

  constructor(object: T) {
    this.object = object
  }

  tag(): void {
    this.tagged = true
  }

  untag(): void {
    this.tagged = false
  }

  get tagged(): boolean {
    return this._tagged
  }

  set tagged(value: boolean) {
    this._tagged = value
  }
}