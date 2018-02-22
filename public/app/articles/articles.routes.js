System.register(["./articles.component.js", "./create/create.component.js", "./list/list.component.js", "./view/view.component.js", "./edit/edit.component.js"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var articles_component_js_1, create_component_js_1, list_component_js_1, view_component_js_1, edit_component_js_1, ArticlesRoutes;
    return {
        setters: [
            function (articles_component_js_1_1) {
                articles_component_js_1 = articles_component_js_1_1;
            },
            function (create_component_js_1_1) {
                create_component_js_1 = create_component_js_1_1;
            },
            function (list_component_js_1_1) {
                list_component_js_1 = list_component_js_1_1;
            },
            function (view_component_js_1_1) {
                view_component_js_1 = view_component_js_1_1;
            },
            function (edit_component_js_1_1) {
                edit_component_js_1 = edit_component_js_1_1;
            }
        ],
        execute: function () {
            exports_1("ArticlesRoutes", ArticlesRoutes = [{
                    path: 'articles',
                    component: articles_component_js_1.ArticlesComponent,
                    children: [
                        { path: '', component: list_component_js_1.ListComponent },
                        { path: 'create', component: create_component_js_1.CreateComponent },
                        { path: ':articleId', component: view_component_js_1.ViewComponent },
                        { path: ':articleId/edit', component: edit_component_js_1.EditComponent }
                    ]
                }]);
        }
    };
});
//# sourceMappingURL=articles.routes.js.map