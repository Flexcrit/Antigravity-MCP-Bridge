import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import os from "os";
import { z } from "zod";

// ─── Server Instantiation ────────────────────────────────────────────────────

const server = new McpServer({
  name: "antigravity-mcp-bridge",
  version: "1.0.0",
});

// ─── Tool: system_status ─────────────────────────────────────────────────────

server.tool(
  "system_status",
  "Returns the current UTC time and key operating system details.",
  {},
  async () => {
    const status = {
      currentTime: new Date().toISOString(),
      platform: os.platform(),
      release: os.release(),
      architecture: os.arch(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
      uptime: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
      nodeVersion: process.version,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }
);

// ─── Transport & Start ───────────────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[antigravity-mcp-bridge] Server running on stdio transport.");
}

main().catch((err) => {
  console.error("[antigravity-mcp-bridge] Fatal error:", err);
  process.exit(1);
});
