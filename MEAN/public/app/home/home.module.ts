import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeRoutes } from './home.routes.js';
import { HomeComponent } from './home.component.js';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(HomeRoutes),
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule {}
