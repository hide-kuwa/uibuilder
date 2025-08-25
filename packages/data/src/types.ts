import { z } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiEndpoint<TParams = any, TBody = any, TResp = any> = {
  id: string;
  method: HttpMethod;
  path: string;
  paramsSchema?: z.ZodType<TParams>;
  bodySchema?: z.ZodType<TBody>;
  respSchema: z.ZodType<TResp>;
};

export type QueryDescriptor = {
  endpointId: string;
  params?: any;
  select?: string;
};

export type DataBinding =
  | { type: "query"; query: QueryDescriptor }
  | { type: "expr"; expr: string };

export type DataBindings = Record<string, DataBinding>;
