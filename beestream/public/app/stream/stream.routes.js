System.register(["./stream.component"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var stream_component_1, StreamRoutes;
    return {
        setters: [
            function (stream_component_1_1) {
                stream_component_1 = stream_component_1_1;
            }
        ],
        execute: function () {
            exports_1("StreamRoutes", StreamRoutes = [{
                    path: 'stream',
                    component: stream_component_1.StreamComponent
                }]);
        }
    };
});
//# sourceMappingURL=stream.routes.js.map