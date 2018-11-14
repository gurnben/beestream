import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  MatInputModule,
          MatFormFieldModule,
          MatButtonModule,
          MatIconModule,
          MatCheckboxModule,
          MatDatepickerModule,
          MatNativeDateModule
       } from '@angular/material';

import { DashboardRoutes } from './dashboard.routes';
import { DashboardComponent } from './dashboard.component';
import { VideoService } from '../video/video.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
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
