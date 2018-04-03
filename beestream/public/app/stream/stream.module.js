System.register(["@angular/core", "@angular/common", "@angular/router", "./stream.routes", "./stream.component"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, common_1, router_1, stream_routes_1, stream_component_1, StreamModule;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (stream_routes_1_1) {
                stream_routes_1 = stream_routes_1_1;
            },
            function (stream_component_1_1) {
                stream_component_1 = stream_component_1_1;
            }
        ],
        execute: function () {
            StreamModule = class StreamModule {
            };
            StreamModule = __decorate([
                core_1.NgModule({
                    imports: [
                        common_1.CommonModule,
                        router_1.RouterModule.forChild(stream_routes_1.StreamRoutes)
                    ],
                    declarations: [
                        stream_component_1.StreamComponent
                    ]
                })
            ], StreamModule);
            exports_1("StreamModule", StreamModule);
        }
    };
});
//# sourceMappingURL=stream.module.js.map