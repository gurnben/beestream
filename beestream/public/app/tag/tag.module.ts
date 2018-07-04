import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  MatInputModule,
          MatButtonModule,
          MatIconModule
       } from '@angular/material';
import { TagComponent } from './tag.component';
import { VideoService } from '../video/video.service'

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [
    TagComponent
  ],
  providers: [
    VideoService
  ],
  exports: [
    TagComponent
  ]
})
export class TagModule {}
