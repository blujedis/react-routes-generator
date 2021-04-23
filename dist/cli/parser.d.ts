/**
 * Ultra simple command line parser.
 */
export declare const argv: string[];
export declare type ParseType = string | number | boolean;
export declare const parsed: {
    flags: {
        [key: string]: ParseType | ParseType[];
    };
    cmds: string[];
    skip: number[];
};
