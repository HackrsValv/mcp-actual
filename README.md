# MCP Actual Budget Server

A simple server that exposes [Actual Budget](https://actualbudget.org/) data via the
Model Context Protocol. The server defines a couple of tools that can be used by
MCP clients:

- `getNetWorth` – returns the current net worth in cents.
- `getTransactions` – searches transactions using a query string.

This project targets **Node.js 20** or later.

## Environment variables

The server expects the following environment variables:

| Variable           | Description                                      |
|--------------------|--------------------------------------------------|
| `ACTUAL_API_URL`   | Base URL of your Actual server                   |
| `ACTUAL_API_KEY`   | API key used to authenticate with Actual         |
| `MCP_SERVER_PORT`  | Port for the MCP server (default: `5005`)        |

## Building and running

Install dependencies and compile the TypeScript sources (Node 20 recommended):

```bash
npm install
npm run build
```

Then start the server:

```bash
npm start
```

The server listens on `MCP_SERVER_PORT` (5005 by default).

## Running tests

The project includes a small test suite. Run it using `npm`:

```bash
npm test
```

Alternatively you can use `make`:

```bash
make tests
```

### Docker

Alternatively you can build and run the container image:

```bash
podman build -t mcp-actual-server .
podman run -p 5005:5005 \
  -e ACTUAL_API_URL=http://your-actual:5006 \
  -e ACTUAL_API_KEY=secret \
  mcp-actual-server
```
