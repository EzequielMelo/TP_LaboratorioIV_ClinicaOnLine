import { Component } from '@angular/core';
import { CreateNewAdminSectionComponent } from '../../components/admin-dashboard-components/create-new-admin-section/create-new-admin-section.component';

@Component({
  selector: 'app-add-admin',
  standalone: true,
  imports: [CreateNewAdminSectionComponent],
  templateUrl: './add-admin.component.html',
  styleUrl: './add-admin.component.css',
})
export class AddAdminComponent {}
