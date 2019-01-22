import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

/*DashboardRoutes
* This file defines all the routes associated with our dashboard page.  If you
* want to add any redirects to this page or non-optional URL parameters, make
* the changes here!
*/
export const DashboardRoutes: Routes = [{
  path: 'dashboard',
  component: DashboardComponent
},
{
  path: 'dash',
  redirectTo: '/dashboard',
  pathMatch:'full'
}];
