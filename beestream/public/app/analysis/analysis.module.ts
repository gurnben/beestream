import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';

import { AnalysisComponent } from './analysis.component';
import { VideoService } from '../video/video.service';

/*This module handles the necessary imports, declarations, and provider
* configurations for the analysis component.  It exports the analysis component.
* If you want to use the analysis component, import this module!
*/
@NgModule({
  imports: [
    CommonModule,
    MatIconModule
  ],
  declarations: [
    AnalysisComponent
  ],
  providers: [
    VideoService
  ],
  exports: [
    AnalysisComponent
  ]
})
export class AnalysisModule {}
