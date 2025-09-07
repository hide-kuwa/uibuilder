import * as react_jsx_runtime from 'react/jsx-runtime';
import { GridSchema } from '@chizu/types/gridsheet';

type Row = Record<string, any>;
type Props = {
    schema: GridSchema;
    rows?: Row[];
    dataKey?: string;
};
declare function GridSheet({ schema, rows: initRows }: Props): react_jsx_runtime.JSX.Element;

export { GridSheet };
