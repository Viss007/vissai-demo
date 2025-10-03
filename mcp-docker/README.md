# Docker MCP Server (safe-by-default)

This is a minimal MCP server exposing a small set of Docker operations with strong guardrails.

## Features

- Read tools (default): list containers, inspect container, tail logs
- Write tools (opt-in): restart container, pull allow-listed image
- Only containers with label `mcp=allowed` are permitted
- Timeouts (10s), tail defaults (200 lines), trimmed log output

## Install & Run

```bash
cd mcp-docker
npm install
npm run build
ALLOW_WRITE=false IMAGE_ALLOWLIST="nginx:alpine,hello-world" npm start
```

If Docker is unavailable, tools will return `{ ok:false, error:"Docker not reachable" }`.

## VS Code MCP Configuration

Add this to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "docker-mcp": {
      "command": "node",
      "args": ["mcp-docker/dist/server.js"],
      "env": { "ALLOW_WRITE": "false" }
    }
  }
}
```

## Tools

- docker.listContainers({ all?, label? })
- docker.containerLogs({ id, tail? })
- docker.inspectContainer({ id })
- docker.restartContainer({ id, confirm })  // requires ALLOW_WRITE=true
- docker.pullImage({ name, confirm })       // requires ALLOW_WRITE=true & allowlist

## Policy

- Write operations require both env `ALLOW_WRITE=true` and `confirm: true` input
- Containers must have label `mcp=allowed`
- Images must be in `IMAGE_ALLOWLIST`

## CI/Self-test

You can run a quick self-test to verify read operations and basic connectivity:

```bash
node mcp-docker/dist/server.js --self-test
```

Expected output (shape):

```json
{ "ok": true, "count": 1, "logs": { "ok": true, "data": { "id": "...", "tail": 50, "logs": "..." } } }
```

Notes:
- Containers must be labeled `mcp=allowed` to be listed and for logs to be fetched.
- The GitHub Actions CI runs this self-test in a read-only job.
