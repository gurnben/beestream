import { Routes } from '@angular/router';
import { StreamComponent } from './stream.component';

/*StreamRoutes
* This file defines all the routes associated with our streaming page.  If you
* want to add any redirects to this page or non-optional URL parameters, make
* the changes here!
*/
export const StreamRoutes: Routes = [{
  path: 'stream',
  component: StreamComponent
}];
