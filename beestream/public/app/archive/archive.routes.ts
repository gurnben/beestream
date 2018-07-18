import { Routes } from '@angular/router';
import { ArchiveComponent } from './archive.component';

/*ArchiveRoutes
* This file defines all the routes associated with our archive page.  If you
* want to add any redirects to this page or non-optional URL parameters, make
* the changes here!
*/
export const ArchiveRoutes: Routes = [{
  path: 'archive',
  component: ArchiveComponent
}];
