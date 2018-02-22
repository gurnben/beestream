import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ArticlesRoutes } from './articles.routes.js';
import { ArticlesComponent } from './articles.component.js';
import { CreateComponent } from './create/create.component.js';
import { ListComponent } from './list/list.component.js';
import { ViewComponent } from './view/view.component.js';
import { EditComponent } from './edit/edit.component.js';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(ArticlesRoutes)
  ],
  declarations: [
    ArticlesComponent,
    CreateComponent,
    ListComponent,
    ViewComponent,
    EditComponent
  ]
})
export class ArticlesModule {}
