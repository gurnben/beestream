import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

/*HomeRoutes
* This object defines the routes for our home component, in this case the
* homepage is rendered at the base url.  If you want to render the homepage in
* a different location, you should change this object!
*/
export const HomeRoutes: Routes = [{
  path: '',
  component: HomeComponent
}];
