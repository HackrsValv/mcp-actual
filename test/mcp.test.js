import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createServer } from '../dist/mcp.js';

async function startServer(tools) {
  const server = createServer({ tools });
  await new Promise(res => server.listen(0, res));
  const port = server.address().port;
  return { server, port };
}

async function request(port, body, options = {}) {
  return await new Promise((resolve, reject) => {
    const req = http.request({
      method: options.method || 'POST',
      hostname: 'localhost',
      port,
      path: options.path || '/',
      headers: {
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body !== undefined) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

test('successful tool execution', async () => {
  const tools = [{
    name: 'hello',
    description: 'Greets the user',
    inputs: { name: 'string' },
    run: ({ name }) => `Hello ${name}`
  }];
  const { server, port } = await startServer(tools);
  const res = await request(port, { tool: 'hello', args: { name: 'World' } });
  server.close();

  assert.equal(res.status, 200);
  const result = JSON.parse(res.body).result;
  assert.equal(result, 'Hello World');
});

test('unknown tool returns 404', async () => {
  const { server, port } = await startServer([]);
  const res = await request(port, { tool: 'missing' });
  server.close();

  assert.equal(res.status, 404);
});

test('non-POST request returns 404', async () => {
  const { server, port } = await startServer([]);
  const res = await request(port, undefined, { method: 'GET' });
  server.close();

  assert.equal(res.status, 404);
});
