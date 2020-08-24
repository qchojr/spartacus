import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CurrencyService, I18nModule, UrlModule } from '@spartacus/core';
import { FormErrorsModule } from '@spartacus/storefront';
import { PermissionFormComponent } from './permission-form.component';
import { OrgUnitService } from '../../../core/services/org-unit.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgSelectModule,
    UrlModule,
    I18nModule,
    ReactiveFormsModule,
    FormErrorsModule,
  ],
  declarations: [PermissionFormComponent],
  exports: [PermissionFormComponent],
  providers: [CurrencyService, OrgUnitService],
  entryComponents: [PermissionFormComponent],
})
export class PermissionFormModule {}