import { Component, Input } from '@angular/core';
import { Admin } from '../../../classes/admin.class';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [],
  templateUrl: './admin-list.component.html',
  styleUrl: './admin-list.component.css',
})
export class AdminListComponent {
  @Input() data: Admin[] | null = null;
}
