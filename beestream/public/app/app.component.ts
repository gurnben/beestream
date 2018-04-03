import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'beestream',
  template: '<header></header><router-outlet></router-outlet><footer></footer>'
})
export class AppComponent {
  constructor(private router: Router) {}
}
