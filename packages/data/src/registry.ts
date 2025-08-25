import { z } from "zod";
import type { ApiEndpoint } from "./types";

export const endpoints: Record<string, ApiEndpoint<any, any, any>> = {
  "journals.list": {
    id: "journals.list",
    method: "GET",
    path: "/api/journals",
    paramsSchema: z.object({ companyId: z.string().optional() }),
    respSchema: z.object({
      data: z.array(z.object({ id: z.string(), title: z.string().optional() })),
    }),
  },
  "journals.create": {
    id: "journals.create",
    method: "POST",
    path: "/api/journals",
    bodySchema: z.object({ title: z.string() }),
    respSchema: z.object({ ok: z.boolean(), id: z.string().optional() }),
  },
  "dmn.run": {
    id: "dmn.run",
    method: "POST",
    path: "/api/dmn/:key",
    paramsSchema: z.object({ key: z.string() }),
    bodySchema: z.record(z.any()),
    respSchema: z.object({ result: z.any(), trace: z.array(z.any()).optional() }),
  },
};
