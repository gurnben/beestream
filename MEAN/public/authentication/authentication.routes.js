System.register(["./authentication.component.js", "./signin/signin.component.js", "./signup/signup.component.js"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var authentication_component_js_1, signin_component_js_1, signup_component_js_1, AuthenticationRoutes;
    return {
        setters: [
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
            exports_1("AuthenticationRoutes", AuthenticationRoutes = [{
                    path: 'authentication',
                    component: authentication_component_js_1.AuthenticationComponent,
                    children: [
                        {
                            path: 'signin',
                            component: signin_component_js_1.SigninComponent
                        },
                        {
                            path: 'signup',
                            component: signup_component_js_1.SignupComponent
                        }
                    ]
                }]);
        }
    };
});
//# sourceMappingURL=authentication.routes.js.map