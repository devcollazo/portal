import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject } from 'rxjs';

export interface PocketEntryRecord {
  id: string;
  title: string;
  description: string;
  image_url: string;
  entry_url: string;
  created: string;
}

export type NewPocketEntryPayload = {
  title: string;
  description: string;
  image: string;
  link: string;
};

interface FileUploadRecord {
  id: string;
  title?: string;
  type?: string;
  file: string;
}
@Injectable({
  providedIn: 'root'
})
export class PocketBaseService {
  private readonly pb = new PocketBase('https://base.devcollazo.work.gd');
  private readonly authState = new BehaviorSubject(this.pb.authStore.isValid);

  constructor() {
    this.pb.authStore.onChange(() => this.authState.next(this.pb.authStore.isValid));
  }

  get authState$() {
    return this.authState.asObservable();
  }

  get isAuthenticated() {
    return this.pb.authStore.isValid;
  }

  get authToken() {
    return this.pb.authStore.token;
  }

  login(email: string, password: string) {
    return this.pb.collection('users').authWithPassword(email, password);
  }

  logout() {
    this.pb.authStore.clear();
  }

  fetchEntries() {
    return this.pb.collection('portal_entries').getFullList<PocketEntryRecord>(200, {
      sort: '-created'
    });
  }

  createEntry(payload: NewPocketEntryPayload) {
    return this.pb.collection('portal_entries').create({
      title: payload.title,
      description: payload.description,
      image_url: payload.image,
      entry_url: payload.link
    });
  }

  deleteEntry(id: string) {
    return this.pb.collection('portal_entries').delete(id);
  }

  updateEntry(id: string, payload: NewPocketEntryPayload) {
    return this.pb.collection('portal_entries').update(id, {
      title: payload.title,
      description: payload.description,
      image_url: payload.image,
      entry_url: payload.link
    });
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const record = (await this.pb.collection('files').create(formData)) as FileUploadRecord;
    if (!record?.file) {
      throw new Error('La carga no devolvió una URL válida.');
    }

    return this.pb.getFileUrl(record, record.file);
  }
}
