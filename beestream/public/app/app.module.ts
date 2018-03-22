import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { HomeModule } from './home/home.module';
import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    HomeModule,
    RouterModule.forRoot(AppRoutes)
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
