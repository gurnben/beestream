import { Component } from '@angular/core';
import { Router } from '@angular/router';

/*AppComponent
* This is the primary component for our webapp and also the primary entrance
* point for beestream.  This component contains a template that defines the
* basic appearance of our entire application.  If you wish to change the setup
* of the web application overall, you can change it here in the template, but
* proceed with great caution!
*
* NOTE: the router-outlet allows us to dynamically change the webpage's main
*       content to adapt to the angular router's routing scheme. For example:
*       this allows us to change from the archive page to the streaming page
*       without refreshing the page and reloading the header/footer.
*/
@Component({
  selector: 'beestream',
  template: '<header></header><router-outlet></router-outlet><footer></footer>'
})
export class AppComponent {
  constructor(private router: Router) {}
}
