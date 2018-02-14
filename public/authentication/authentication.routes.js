System.register(["./authentication.component", "./signin/signin.component", "./signup/signup.component"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var authentication_component_1, signin_component_1, signup_component_1, AuthenticationRoutes;
    return {
        setters: [
            function (authentication_component_1_1) {
                authentication_component_1 = authentication_component_1_1;
            },
            function (signin_component_1_1) {
                signin_component_1 = signin_component_1_1;
            },
            function (signup_component_1_1) {
                signup_component_1 = signup_component_1_1;
            }
        ],
        execute: function () {
            exports_1("AuthenticationRoutes", AuthenticationRoutes = [{
                    path: 'authentication',
                    component: authentication_component_1.AuthenticationComponent,
                    children: [
                        {
                            path: 'signin',
                            component: signin_component_1.SigninComponent
                        },
                        {
                            path: 'signup',
                            component: signup_component_1.SignupComponent
                        }
                    ]
                }]);
        }
    };
});
//# sourceMappingURL=authentication.routes.js.map