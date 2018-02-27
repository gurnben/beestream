import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service.js';

@Component({
  selector: 'signup',
  templateUrl: './authentication/signup/signup.template.html'
})
export class SignupComponent {
  errorMessage: string;
  user: any = {};

  constructor (private _authenticationService: AuthenticationService, private _router: Router) {}

  signup() {
    console.log(this.user);
    this._authenticationService.signup(this.user)
    .subscribe(
      result => this._router.navigate(['/']),
      error => this.errorMessage = error
    );
  }
}
