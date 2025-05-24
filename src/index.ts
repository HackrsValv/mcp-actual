import { createServer, ToolDefinition } from "./mcp";
declare const process: any;

const API_URL = process.env.ACTUAL_API_URL!;
const API_KEY = process.env.ACTUAL_API_KEY!;
const PORT = parseInt(process.env.MCP_SERVER_PORT || "5005", 10);

async function callActual(path: string, params: Record<string, any> = {}) {
  const url = new URL(`${API_URL}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: { "X-API-Key": API_KEY },
  });
  return res.json();
}

const tools: ToolDefinition[] = [
  {
    name: "getNetWorth",
    description: "Returns your current net worth from Actual Budget",
    inputs: {},
    output: { type: "number", description: "Net worth in cents" },
    run: async () => {
      const data = await callActual("net-worth");
      return data.net_worth;
    }
  },
  {
    name: "getTransactions",
    description: "Search transactions by query string",
    inputs: { query: { type: "string" } },
    output: { type: "array", items: { type: "object" }, description: "List of transactions" },
    run: async ({ query }) => {
      const data = await callActual("transactions", { q: query });
      return data.items;
    }
  },
  {
    name: "getAccounts",
    description: "Returns a list of accounts",
    inputs: {},
    output: { type: "array", items: { type: "object" } },
    run: async () => {
      const data = await callActual("accounts");
      return data.items || data;
    }
  }
];

createServer({ tools })
  .then(server => {
    server.listen(PORT, () => {
      console.log(`MCP server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to start MCP server:", err);
    process.exit(1);
  });

