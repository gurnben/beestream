System.register(["./archive.component"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var archive_component_1, ArchiveRoutes;
    return {
        setters: [
            function (archive_component_1_1) {
                archive_component_1 = archive_component_1_1;
            }
        ],
        execute: function () {
            exports_1("ArchiveRoutes", ArchiveRoutes = [{
                    path: 'archive',
                    component: archive_component_1.ArchiveComponent
                }]);
        }
    };
});
//# sourceMappingURL=archive.routes.js.map