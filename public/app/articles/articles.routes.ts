import { Routes } from '@angular/router';
import { ArticlesComponent } from './articles.component.js';
import { CreateComponent } from './create/create.component.js';
import { ListComponent } from './list/list.component.js';
import { ViewComponent } from './view/view.component.js';
import { EditComponent } from './edit/edit.component.js';

export const ArticlesRoutes: Routes = [{
  path: 'articles',
  component: ArticlesComponent,
  children: [
    {path: '', component: ListComponent},
    {path: 'create', component: CreateComponent},
    {path: ':articleId', component: ViewComponent},
    {path: ':articleId/edit', component:EditComponent}
  ]
}];
