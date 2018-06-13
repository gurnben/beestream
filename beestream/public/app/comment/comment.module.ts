import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  MatInputModule,
          MatFormFieldModule,
          MatButtonModule,
          MatIconModule
       } from '@angular/material';
import { CommentComponent } from './comment.component';
import { VideoService } from '../video/video.service'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [
    CommentComponent
  ],
  providers: [
    VideoService
  ],
  exports: [
    CommentComponent
  ]
})
export class CommentModule {}
