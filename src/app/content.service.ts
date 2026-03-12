import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NewPocketEntryPayload, PocketBaseService, PocketEntryRecord } from './pocket-base.service';

export interface PortalContent {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly state$ = new BehaviorSubject<PortalContent[]>([]);
  readonly contents$ = this.state$.asObservable();

  constructor(private readonly pocketBase: PocketBaseService) {
    this.refresh();
    this.pocketBase.authState$.subscribe((isAuth) => {
      if (isAuth) {
        this.refresh();
      }
    });
  }

  refresh(): Promise<void> {
    return this.pocketBase
      .fetchEntries()
      .then((records: PocketEntryRecord[]) => this.state$.next(records.map((record) => this.toPortalContent(record))))
      .catch((error: unknown) => {
        console.error('Error cargando contenido del portal', error);
        this.state$.next([]);
      });
  }

  add(entry: NewPocketEntryPayload): Promise<void> {
    return this.pocketBase.createEntry(entry).then(() => this.refresh());
  }

  remove(id: string): Promise<void> {
    return this.pocketBase.deleteEntry(id).then(() => this.refresh());
  }

  update(id: string, entry: NewPocketEntryPayload): Promise<void> {
    return this.pocketBase.updateEntry(id, entry).then(() => this.refresh());
  }

  private toPortalContent(record: PocketEntryRecord): PortalContent {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      image: record.image_url,
      link: record.entry_url,
      createdAt: record.created
    };
  }
}
