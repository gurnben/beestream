import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StreamRoutes } from './stream.routes';
import { StreamComponent } from './stream.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(StreamRoutes)
  ],
  declarations: [
    StreamComponent
  ]
})
export class StreamModule {}
