System.register(["@angular/core", "@angular/router", "../authentication.service.js"], function (exports_1, context_1) {
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
    var core_1, router_1, authentication_service_js_1, SignupComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (authentication_service_js_1_1) {
                authentication_service_js_1 = authentication_service_js_1_1;
            }
        ],
        execute: function () {
            SignupComponent = class SignupComponent {
                constructor(_authenticationService, _router) {
                    this._authenticationService = _authenticationService;
                    this._router = _router;
                    this.user = {};
                }
                signup() {
                    console.log(this.user);
                    this._authenticationService.signup(this.user);
                    // .subscribe(
                    //   result => this._router.navigate(['/']),
                    //   error => this.errorMessage = error
                    // );
                }
            };
            SignupComponent = __decorate([
                core_1.Component({
                    selector: 'signup',
                    templateUrl: './authentication/signup/signup.template.html'
                }),
                __metadata("design:paramtypes", [authentication_service_js_1.AuthenticationService, router_1.Router])
            ], SignupComponent);
            exports_1("SignupComponent", SignupComponent);
        }
    };
});
//# sourceMappingURL=signup.component.js.map