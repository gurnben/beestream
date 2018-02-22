import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';
import { HomeModule } from './home/home.module.js';
import { AuthenticationService } from '../authentication/authentication.service.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { ArticlesModule } from './articles/articles.module.js';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    AuthenticationModule,
    HomeModule,
    ArticlesModule,
    RouterModule.forRoot(AppRoutes)
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    AuthenticationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
