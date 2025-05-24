// Use require to avoid needing Node type definitions
declare function require(name: string): any;
const http = require('http');
type IncomingMessage = any;
type ServerResponse = any;

export interface ToolDefinition {
  name: string;
  description: string;
  inputs: Record<string, any>;
  output: any;
  run: (inputs: any) => Promise<any>;
}

export interface Server {
  listen(port: number, cb?: () => void): void;
}

export async function createServer({ tools }: { tools: ToolDefinition[] }): Promise<Server> {
  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST' || req.url !== '/mcp') {
      res.statusCode = 404;
      res.end();
      return;
    }

    let body = '';
    req.on('data', (chunk: any) => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { tool, inputs } = JSON.parse(body || '{}');
        const t = tools.find(x => x.name === tool);
        if (!t) {
          res.statusCode = 404;
          res.end('Unknown tool');
          return;
        }
        const result = await t.run(inputs || {});
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ result }));
      } catch (err) {
        res.statusCode = 500;
        res.end(String(err));
      }
    });
  });

  return {
    listen: (port: number, cb?: () => void) => server.listen(port, cb),
  };
}
