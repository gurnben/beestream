System.register(["rxjs/Rx", "rxjs/Observable", "@angular/core", "@angular/http"], function (exports_1, context_1) {
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
    var Observable_1, core_1, http_1, ArticlesService;
    return {
        setters: [
            function (_1) {
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            }
        ],
        execute: function () {
            ArticlesService = class ArticlesService {
                constructor(_http) {
                    this._http = _http;
                    this._baseURL = 'api/articles';
                }
                create(article) {
                    return this._http
                        .post(this._baseURL, article)
                        .map((res) => res.json())
                        .catch(this.handleError);
                }
                read(articleId) {
                    return this._http
                        .get(`${this._baseURL}/${articleId}`)
                        .map((res) => res.json())
                        .catch(this.handleError);
                }
                update(article) {
                    return this._http
                        .put(`${this._baseURL}/${article._id}`, article)
                        .map((res) => res.json())
                        .catch(this.handleError);
                }
                delete(articleId) {
                    return this._http
                        .delete(`${this._baseURL}/${articleId}`)
                        .map((res) => res.json())
                        .catch(this.handleError);
                }
                list() {
                    return this._http
                        .get(this._baseURL)
                        .map((res) => res.json())
                        .catch(this.handleError);
                }
                handleError(error) {
                    return Observable_1.Observable.throw(error.json().message || 'Server error');
                }
            };
            ArticlesService = __decorate([
                core_1.Injectable(),
                __metadata("design:paramtypes", [http_1.Http])
            ], ArticlesService);
            exports_1("ArticlesService", ArticlesService);
        }
    };
});
//# sourceMappingURL=articles.service.js.map