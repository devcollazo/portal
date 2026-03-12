import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService, PortalContent } from '../content.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  get contents() {
    return this.contentService.contents$;
  }

  constructor(private contentService: ContentService) {}

  trackById(_: number, item: PortalContent) {
    return item.id;
  }
}
