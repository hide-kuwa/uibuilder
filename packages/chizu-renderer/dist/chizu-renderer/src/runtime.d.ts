import React from 'react';
type Scope = 'local' | 'page' | 'frame' | 'app' | 'api';
export interface RuntimeValue {
    page?: Record<string, any>;
    frame?: Record<string, any>;
    app?: Record<string, any>;
    api?: Record<string, any>;
}
export declare function RuntimeProvider({ value, children }: {
    value: RuntimeValue;
    children: React.ReactNode;
}): React.FunctionComponentElement<React.ProviderProps<RuntimeValue>>;
export declare function useFlowRuntime(): RuntimeValue;
export declare function getRef(runtime: RuntimeValue, scope: Scope, path: string): any;
export declare function evalFormula(expr: string, inputs: any[]): any;
export {};
