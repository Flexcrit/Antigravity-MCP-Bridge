# Antigravity MCP Bridge

A TypeScript-based **Model Context Protocol (MCP)** server template wired into the **Antigravity** agentic environment. It exposes tools over a `stdio` transport and ships with a ready-to-import SQLite skill for local database access.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Antigravity | latest |

---

## Project Structure

```
antigravity-mcp-bridge/
├── src/
│   └── server.ts          # MCP server — stdio transport + tools
├── skills/
│   └── sqlite_skill.json  # Antigravity Global Skill definition
├── dist/                  # Compiled JS output (after build)
├── auto_bridge.sh         # Detects MCP configs & writes env settings
├── tsconfig.json
├── package.json
└── README.md
```

---

## 1 · Starting the MCP Server

### Build & run (recommended)

```bash
# Install dependencies (first time only)
npm install

# Compile TypeScript → dist/
npm run build

# Start the server
node dist/server.js
```

The server writes a startup message to **stderr** and listens for MCP messages on **stdin/stdout**.

### Development mode (ts-node)

```bash
npx ts-node src/server.ts
```

### Auto-bridge setup

Run `auto_bridge.sh` once after cloning (or whenever your MCP config changes). It scans well-known config locations, detects your Node environment, and writes `.env.mcp` plus a descriptor into `~/.antigravity/mcp/`.

```bash
chmod +x auto_bridge.sh   # already done if you followed setup
./auto_bridge.sh
```

---

## 2 · Importing the SQLite Skill into Antigravity Manager

1. **Open** the Antigravity desktop app and navigate to the **Manager View** (sidebar → 🧩 Manager).
2. Click **Import Skill** (top-right of the Skills panel).
3. In the file picker, navigate to:
   ```
   /path/to/antigravity-mcp-bridge/skills/sqlite_skill.json
   ```
   and select it.
4. Antigravity will validate the skill schema and display a **"SQLite Database Connector"** card under the **Data Sources** category.
5. Click **Configure** on the card and fill in the required field:
   - **SQLite Database Path** — absolute path to your `.db` / `.sqlite` file, e.g. `/Users/sameer/data/myapp.db`
6. Click **Save & Activate**. The skill is now globally available to all agents.

> **Tip:** You can activate / deactivate the skill at any time from the Manager View without removing the import.

---

## 3 · Testing the Connection with the Built-in Browser

Antigravity ships a built-in **MCP Inspector** browser that lets you call tools interactively.

### Step-by-step

1. Start the MCP server (see §1 above) so it is listening.
2. In Antigravity, open **Settings → MCP Servers** and click **+ Add Server**.
3. Set:
   - **Transport**: `stdio`
   - **Command**: `node /path/to/antigravity-mcp-bridge/dist/server.js`
4. Click **Connect**. The status indicator should turn **green**.
5. Navigate to **Tools** tab inside the MCP Inspector.
6. Select the **`system_status`** tool, leave the input blank (no parameters), and click **Run**.
7. The response pane should display a JSON payload similar to:
   ```json
   {
     "currentTime": "2026-04-23T02:19:15.000Z",
     "platform": "darwin",
     "release": "24.4.0",
     "architecture": "arm64",
     "hostname": "MacBook-Pro",
     "cpus": 10,
     "totalMemoryMB": 16384,
     "freeMemoryMB": 4096,
     "uptime": "3h 42m",
     "nodeVersion": "v22.0.0"
   }
   ```
8. To test the **SQLite skill**, ensure the skill is imported and configured (§2), then ask an agent: *"List all tables in my database."* The agent will invoke `sqlite_list_tables` via the MCP bridge automatically.

---

## Available Tools

| Tool | Description |
|---|---|
| `system_status` | Returns current UTC time and OS details |
| `sqlite_query` | Execute a read-only SQL SELECT |
| `sqlite_execute` | Execute a write SQL statement |
| `sqlite_list_tables` | List all tables in the SQLite DB |
| `sqlite_describe_table` | Describe columns of a table |

---

## Scripts

```bash
npm run build    # tsc — compile src/ → dist/
npm run dev      # ts-node src/server.ts (watch mode)
npm run start    # node dist/server.js
```

---

## Adding More Tools

Open `src/server.ts` and call `server.tool(name, description, inputSchema, handler)`:

```typescript
server.tool(
  "my_new_tool",
  "Does something useful.",
  { param: z.string().describe("An example parameter") },
  async ({ param }) => ({
    content: [{ type: "text", text: `You passed: ${param}` }],
  })
);
```

Rebuild with `npm run build` and reconnect in Antigravity.

---

## License

MIT

## Created by:
Sameer Abrar, Flexcrit Inc