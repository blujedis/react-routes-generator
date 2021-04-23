import { IParsedRoutes } from './types';
import { Options } from './defaults';
export declare function generator(options?: Options): {
    filter: (filters: string | string[]) => string[];
    parse: (paths: string[]) => IParsedRoutes;
    generate: (parsed?: IParsedRoutes | undefined) => void;
};
