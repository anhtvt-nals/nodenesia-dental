import { Injectable, type MessageEvent } from '@nestjs/common';
import { filter, interval, map, merge, Observable, Subject } from 'rxjs';

export type BookingStatusEvent = {
  code: string;
  status: string;
};

@Injectable()
export class BookingStatusStreamService {
  private readonly events$ = new Subject<BookingStatusEvent>();

  publish(code: string, status: string) {
    this.events$.next({ code, status });
  }

  stream(code: string): Observable<MessageEvent> {
    const statusEvents = this.events$.pipe(
      filter((event) => event.code === code),
      map((event): MessageEvent => ({ type: 'status', data: event })),
    );
    const heartbeat = interval(25_000).pipe(
      map((): MessageEvent => ({ type: 'ping', data: { ts: Date.now() } })),
    );
    return merge(statusEvents, heartbeat);
  }
}
