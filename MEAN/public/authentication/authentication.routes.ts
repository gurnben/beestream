import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication.component.js';
import { SigninComponent } from './signin/signin.component.js';
import { SignupComponent } from './signup/signup.component.js';

export const AuthenticationRoutes: Routes = [{
  path: 'authentication',
  component: AuthenticationComponent,
  children: [
    {
      path: 'signin',
      component: SigninComponent
    },
    {
      path: 'signup',
      component: SignupComponent
    }
  ]
}];
