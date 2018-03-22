import { Component } from '@angular/core';
import { ArticlesService } from './articles.service.js';
@Component({
  selector: 'articles',
  template: '<router-outlet></router-outlet>',
  providers: [ArticlesService]
})
export class ArticlesComponent {}
