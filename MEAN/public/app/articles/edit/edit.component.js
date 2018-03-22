System.register(["@angular/core", "@angular/router", "../articles.service"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, router_1, articles_service_1, EditComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (articles_service_1_1) {
                articles_service_1 = articles_service_1_1;
            }
        ],
        execute: function () {
            EditComponent = class EditComponent {
                constructor(_router, _route, _articlesService) {
                    this._router = _router;
                    this._route = _route;
                    this._articlesService = _articlesService;
                    this.article = {};
                }
                ngOnInit() {
                    this.paramsObserver = this._route.params.subscribe(params => {
                        let articleId = params['articleId'];
                        this._articlesService.read(articleId).subscribe(article => {
                            this.article = article;
                        }, error => this._router.navigate(['/articles']));
                    });
                }
                ngOnDestroy() {
                    this.paramsObserver.unsubscribe();
                }
                update() {
                    this._articlesService.update(this.article).subscribe(savedArticle => this._router.navigate(['/articles', savedArticle._id]), error => this.errorMessage = error);
                }
            };
            EditComponent = __decorate([
                core_1.Component({
                    selector: 'edit',
                    templateUrl: 'app/articles/edit/edit.template.html'
                }),
                __metadata("design:paramtypes", [router_1.Router,
                    router_1.ActivatedRoute,
                    articles_service_1.ArticlesService])
            ], EditComponent);
            exports_1("EditComponent", EditComponent);
        }
    };
});
//# sourceMappingURL=edit.component.js.map