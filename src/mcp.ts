import http from 'http';

export interface ToolDefinition {
  name: string;
  description?: string;
  inputs: Record<string, unknown>;
  output?: unknown;
  run(args: any): Promise<any> | any;
}

export function createServer(opts: { tools: ToolDefinition[] }) {
  const tools = new Map(opts.tools.map(t => [t.name, t]));

  return http.createServer(async (req: any, res: any) => {
    if (req.method !== 'POST' || req.url !== '/') {
      res.statusCode = 404;
      res.end();
      return;
    }

    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const { tool, args } = JSON.parse(body || '{}');
      const def = tools.get(tool);
      if (!def) {
        res.statusCode = 404;
        res.end('Unknown tool');
        return;
      }
      const result = await def.run(args || {});
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ result }));
    } catch (err: any) {
      res.statusCode = 500;
      res.end(err?.message ?? 'Error');
    }
  });
}
