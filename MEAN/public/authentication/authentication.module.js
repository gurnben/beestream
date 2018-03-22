System.register(["@angular/core", "@angular/forms", "@angular/router", "./authentication.routes.js", "./authentication.component.js", "./signin/signin.component.js", "./signup/signup.component.js"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, forms_1, router_1, authentication_routes_js_1, authentication_component_js_1, signin_component_js_1, signup_component_js_1, AuthenticationModule;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (authentication_routes_js_1_1) {
                authentication_routes_js_1 = authentication_routes_js_1_1;
            },
            function (authentication_component_js_1_1) {
                authentication_component_js_1 = authentication_component_js_1_1;
            },
            function (signin_component_js_1_1) {
                signin_component_js_1 = signin_component_js_1_1;
            },
            function (signup_component_js_1_1) {
                signup_component_js_1 = signup_component_js_1_1;
            }
        ],
        execute: function () {
            AuthenticationModule = class AuthenticationModule {
            };
            AuthenticationModule = __decorate([
                core_1.NgModule({
                    imports: [
                        forms_1.FormsModule,
                        router_1.RouterModule.forChild(authentication_routes_js_1.AuthenticationRoutes)
                    ],
                    declarations: [
                        authentication_component_js_1.AuthenticationComponent,
                        signin_component_js_1.SigninComponent,
                        signup_component_js_1.SignupComponent
                    ]
                })
            ], AuthenticationModule);
            exports_1("AuthenticationModule", AuthenticationModule);
        }
    };
});
//# sourceMappingURL=authentication.module.js.map