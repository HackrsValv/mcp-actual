import { createServer, ToolDefinition } from './mcp';

const API_URL = process.env.ACTUAL_API_URL!;
const API_KEY = process.env.ACTUAL_API_KEY!;
const PORT = parseInt(process.env.MCP_SERVER_PORT || '5005', 10);

async function callActual(path: string, params: Record<string, string> = {}) {
  const url = new URL(path, API_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { headers: { 'X-API-Key': API_KEY } });
  if (!res.ok) {
    throw new Error(`Actual Budget request failed: ${res.status}`);
  }
  return res.json();
}

const tools: ToolDefinition[] = [
  {
    name: 'getNetWorth',
    description: 'Returns your current net worth from Actual Budget',
    inputs: {},
    output: { type: 'number', description: 'Net worth in cents' },
    run: async () => {
      const data = await callActual('net-worth');
      return data.net_worth ?? data;
    }
  },
  {
    name: 'getTransactions',
    description: 'Search transactions by query string',
    inputs: { query: { type: 'string' } },
    output: { type: 'array', items: { type: 'object' }, description: 'List of transactions' },
    run: async ({ query }: { query: string }) => {
      const data = await callActual('transactions', { q: query });
      return data.items ?? data;
    }
  },
  {
    name: 'getAccounts',
    description: 'Returns a list of accounts',
    inputs: {},
    output: { type: 'array', items: { type: 'object' } },
    run: async () => {
      const data = await callActual('accounts');
      return data.items ?? data;
    }
  }
];

createServer({ tools }).listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
