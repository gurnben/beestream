System.register(["@angular/core", "@angular/platform-browser", "@angular/router", "@angular/http", "./home/home.module", "./archive/archive.module", "./stream/stream.module", "./header/header.component", "./footer/footer.component", "./app.component", "./app.routes"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, platform_browser_1, router_1, http_1, home_module_1, archive_module_1, stream_module_1, header_component_1, footer_component_1, app_component_1, app_routes_1, AppModule;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (home_module_1_1) {
                home_module_1 = home_module_1_1;
            },
            function (archive_module_1_1) {
                archive_module_1 = archive_module_1_1;
            },
            function (stream_module_1_1) {
                stream_module_1 = stream_module_1_1;
            },
            function (header_component_1_1) {
                header_component_1 = header_component_1_1;
            },
            function (footer_component_1_1) {
                footer_component_1 = footer_component_1_1;
            },
            function (app_component_1_1) {
                app_component_1 = app_component_1_1;
            },
            function (app_routes_1_1) {
                app_routes_1 = app_routes_1_1;
            }
        ],
        execute: function () {
            /* Requiring the CSS file */
            require("./style.css");
            AppModule = class AppModule {
            };
            AppModule = __decorate([
                core_1.NgModule({
                    imports: [
                        platform_browser_1.BrowserModule,
                        http_1.HttpModule,
                        home_module_1.HomeModule,
                        archive_module_1.ArchiveModule,
                        stream_module_1.StreamModule,
                        router_1.RouterModule.forRoot(app_routes_1.AppRoutes)
                    ],
                    declarations: [
                        app_component_1.AppComponent,
                        header_component_1.HeaderComponent,
                        footer_component_1.FooterComponent
                    ],
                    bootstrap: [app_component_1.AppComponent]
                })
            ], AppModule);
            exports_1("AppModule", AppModule);
        }
    };
});
//# sourceMappingURL=app.module.js.map