import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ArchiveRoutes } from './archive.routes';
import { ArchiveComponent } from './archive.component';
import { ArchiveService } from './archive.service'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(ArchiveRoutes)
  ],
  declarations: [
    ArchiveComponent
  ],
  providers: [
    ArchiveService
  ]
})
export class ArchiveModule {}
