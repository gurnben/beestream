import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ArchiveRoutes } from './archive.routes';
import { ArchiveComponent } from './archive.component';
import { VideoService } from '../video/video.service'
import { CommentModule } from '../comment/comment.module';
import { AnalysisModule } from '../analysis/analysis.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommentModule,
    AnalysisModule,
    RouterModule.forChild(ArchiveRoutes)
  ],
  declarations: [
    ArchiveComponent
  ],
  providers: [
    VideoService
  ]
})
export class ArchiveModule {}
