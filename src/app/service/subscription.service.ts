import { Injectable } from "@angular/core";
import { IQuerySubscriber } from "../common/subscriber";

@Injectable({
  providedIn: 'root'
})
export class QuerySubscriptionService {
  
  subscribers: IQuerySubscriber[] = []
  
  register(subscriber: IQuerySubscriber): void {
    this.subscribers.push(subscriber)
  }

  unsubscribeAll(): void {
    this.subscribers
      .forEach(subscriber => subscriber.getSubscriptions()
        .forEach(s => s?.unsubscribe()))
  }
}