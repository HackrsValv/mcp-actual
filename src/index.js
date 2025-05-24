import { createServer, ToolDefinition } from "@modelcontextprotocol/mcp";
import axios from "axios";

const API_URL = process.env.ACTUAL_API_URL!;
const API_KEY = process.env.ACTUAL_API_KEY!;
const PORT = parseInt(process.env.MCP_SERVER_PORT || "5005", 10);

async function callActual(path: string, params = {}) {
  const res = await axios.get(`${API_URL}/${path}`, {
    headers: { "X-API-Key": API_KEY },
    params,
  });
  return res.data;
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

