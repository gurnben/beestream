import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { DashboardRoutes } from './dashboard.routes';
import { DashboardComponent } from './dashboard.component';
import { VideoService } from '../video/video.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChartsModule,
    RouterModule.forChild(DashboardRoutes)
  ],
  declarations: [
    DashboardComponent
  ],
  providers: [
    VideoService
  ]
})
export class DashboardModule {}
