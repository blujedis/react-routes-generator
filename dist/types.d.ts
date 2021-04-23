export interface IRouteConfig {
    path: string;
    exact: boolean;
    params: string[];
    isLazy: boolean;
    component: any;
}
export interface IRouteConfigs {
    [key: string]: IRouteConfig;
}
export interface IParsedRoutes {
    configs: IRouteConfigs;
    imports: string[];
    lazy: string[];
}
