// // lib/mcpClient.ts
// import { spawn } from "child_process";

// export async function callMcpTool(name: string, args: any = {}) {
//   return new Promise((resolve, reject) => {
//     const process = spawn("node", ["mcp/server.mjs"]);

//     let output = "";
//     let error = "";

//     // JSON-RPC request to MCP server
//     const payload = JSON.stringify({
//       jsonrpc: "2.0",
//       id: 1,
//       method: "tools/call",
//       params: {
//         name,
//         arguments: args
//       }
//     });

//     // Capture STDOUT
//     process.stdout.on("data", (data) => {
//       output += data.toString();
//     });

//     // Capture STDERR
//     process.stderr.on("data", (data) => {
//       error += data.toString();
//     });

//     // When MCP server exits
//     process.on("close", () => {
//       if (error) {
//         return reject(error);
//       }

//       try {
//         // Parse final JSON only
//         const lines = output.trim().split("\n");
//         const last = lines[lines.length - 1];
//         const json = JSON.parse(last);

//         resolve(json.result);
//       } catch (err) {
//         reject(`Failed to parse MCP output: ${output}`);
//       }
//     });

//     // Send JSON into MCP stdin
//     process.stdin.write(payload + "\n");
//     process.stdin.end();
//   });
// }
import { spawn } from "child_process";

export async function callMcpTool(name: string, args: any = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn("node", ["mcp/server.mjs"]);

    let output = "";
    let error = "";

    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    });

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", () => {
      if (error) return reject(error);

      const lines = output.trim().split("\n");

      // Find the first JSON-looking line
      const jsonLine = lines.find((line) =>
        line.trim().startsWith("{") && line.trim().endsWith("}")
      );

      if (!jsonLine) {
        return reject(
          `❌ No valid JSON from MCP.\nRaw Output:\n${output}`
        );
      }

      try {
        const parsed = JSON.parse(jsonLine);
        resolve(parsed.result);
      } catch (err) {
        reject(
          `❌ Failed to parse JSON:\n${jsonLine}\nError: ${err}`
        );
      }
    });

    process.stdin.write(payload + "\n");
    process.stdin.end();
  });
}
