import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  MatInputModule,
          MatFormFieldModule,
          MatButtonModule,
          MatIconModule,
          MatCheckboxModule,
          MatDatepickerModule,
          MatNativeDateModule,
          MatProgressSpinnerModule
       } from '@angular/material';
import { DashboardRoutes } from './dashboard.routes';
import { DashboardComponent } from './dashboard.component';
import { VideoService } from '../video/video.service';
import { DeparturesChartComponent } from './dashboard-charts/departures-chart/departureschart.component';
import { ArrivalsChartComponent } from './dashboard-charts/arrivals-chart/arrivalschart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(DashboardRoutes)
  ],
  declarations: [
    DashboardComponent,
    DeparturesChartComponent,
    ArrivalsChartComponent
  ],
  providers: [
    VideoService
  ]
})
export class DashboardModule {}
