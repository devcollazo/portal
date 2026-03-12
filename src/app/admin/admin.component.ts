import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContentService, PortalContent } from '../content.service';
import { NewPocketEntryPayload, PocketBaseService } from '../pocket-base.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  get contents() {
    return this.contentService.contents$;
  }

  formModel: NewPocketEntryPayload = {
    title: '',
    description: '',
    image: '',
    link: ''
  };

  loginModel = {
    email: '',
    password: ''
  };

  loginLoading = false;
  loginError = '';
  imageUploading = false;
  imageUploadError = '';
  editingEntryId?: string;
  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  get isAuthenticated() {
    return this.pocketBase.isAuthenticated;
  }

  get authToken() {
    return this.pocketBase.authToken;
  }

  constructor(private contentService: ContentService, private pocketBase: PocketBaseService) {}

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.editingEntryId) {
      await this.contentService.update(this.editingEntryId, this.formModel);
    } else {
      await this.contentService.add(this.formModel);
    }
    this.resetForm(form);
  }

  async onLogin(form: NgForm) {
    if (form.invalid || this.loginLoading) {
      return;
    }

    this.loginError = '';
    this.loginLoading = true;

    try {
      await this.pocketBase.login(this.loginModel.email, this.loginModel.password);
      await this.contentService.refresh();
      form.resetForm({ email: this.loginModel.email, password: '' });
      this.loginModel.password = '';
    } catch (error: unknown) {
      this.loginError = this.formatAuthError(error);
    } finally {
      this.loginLoading = false;
    }
  }

  logout() {
    this.pocketBase.logout();
    this.contentService.refresh();
    this.loginError = '';
  }

  async removeEntry(entry: PortalContent) {
    await this.contentService.remove(entry.id);
  }

  trackById(_: number, item: PortalContent) {
    return item.id;
  }

  private resetForm(form: NgForm) {
    form.resetForm({
      title: '',
      description: '',
      image: '',
      link: ''
    });
    this.formModel = {
      title: '',
      description: '',
      image: '',
      link: ''
    };
    this.editingEntryId = undefined;
  }

  startEditing(entry: PortalContent) {
    this.editingEntryId = entry.id;
    this.formModel = {
      title: entry.title,
      description: entry.description,
      image: entry.image,
      link: entry.link
    };
  }

  cancelEdit(form: NgForm) {
    this.resetForm(form);
  }

  triggerFileInput() {
    this.fileInput?.nativeElement.click();
  }

  async handleFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
      return;
    }

    this.imageUploadError = '';
    this.imageUploading = true;

    try {
      const url = await this.pocketBase.uploadImage(file);
      this.formModel.image = url;
    } catch (error: unknown) {
      this.imageUploadError = error instanceof Error ? error.message : 'No se pudo subir el archivo.';
    } finally {
      this.imageUploading = false;
      target.value = '';
    }
  }

  private formatAuthError(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'No se pudo iniciar sesión con las credenciales suministradas.';
  }
}
