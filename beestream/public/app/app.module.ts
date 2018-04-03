/* Core Imports */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

/* Module Imports from our Project */
import { HomeModule } from './home/home.module';
import { ArchiveModule } from './archive/archive.module';
import { StreamModule } from './stream/stream.module';

/* Component Imports from our project */
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

/* Primary app component imports */
import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';

/* Requiring the CSS file */
require("./style.css");

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    HomeModule,
    ArchiveModule,
    StreamModule,
    RouterModule.forRoot(AppRoutes)
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
