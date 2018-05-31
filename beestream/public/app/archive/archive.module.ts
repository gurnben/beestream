import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  MatInputModule,
          MatFormFieldModule,
          MatButtonModule,
          MatIconModule
       } from '@angular/material';
import { CommentComponent } from '../comment/comment.component';
import { ArchiveRoutes } from './archive.routes';
import { ArchiveComponent } from './archive.component';
import { VideoService } from '../video/video.service'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild(ArchiveRoutes)
  ],
  declarations: [
    ArchiveComponent,
    CommentComponent
  ],
  providers: [
    VideoService
  ]
})
export class ArchiveModule {}
