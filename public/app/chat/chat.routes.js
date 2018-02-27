System.register(["./chat.component.js"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var chat_component_js_1, ChatRoutes;
    return {
        setters: [
            function (chat_component_js_1_1) {
                chat_component_js_1 = chat_component_js_1_1;
            }
        ],
        execute: function () {
            exports_1("ChatRoutes", ChatRoutes = [{
                    path: 'chat',
                    component: chat_component_js_1.ChatComponent
                }]);
        }
    };
});
//# sourceMappingURL=chat.routes.js.map