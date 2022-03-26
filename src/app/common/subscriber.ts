import { Subscription } from "rxjs";

export interface IQuerySubscriber {
  getSubscriptions(): (Subscription | undefined)[]
}