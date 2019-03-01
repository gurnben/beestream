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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DashboardRoutes } from './dashboard.routes';
import { DashboardComponent } from './dashboard.component';
import { VideoService } from '../video/video.service';
import { DeparturesChartComponent } from './dashboard-charts/departures-chart/departureschart.component';
import { ArrivalsChartComponent } from './dashboard-charts/arrivals-chart/arrivalschart.component';
import { RMSLinearChartComponent } from './dashboard-charts/rmslinear-chart/rmslinearchart.component';
import { TemperatureChartComponent } from './dashboard-charts/temperature-chart/temperaturechart.component';
import { WeatherWidget } from './dashboard-charts/weather-widget/weatherwidget.component';

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
    FontAwesomeModule,
    RouterModule.forChild(DashboardRoutes)
  ],
  declarations: [
    DashboardComponent,
    DeparturesChartComponent,
    ArrivalsChartComponent,
    RMSLinearChartComponent,
    TemperatureChartComponent,
    WeatherWidget
  ],
  providers: [
    VideoService
  ]
})
export class DashboardModule {}
