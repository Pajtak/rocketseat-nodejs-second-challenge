import { spawnSync } from "child_process";

const args = process.argv.slice(2);
const result = spawnSync(
  "npx",
  ["ts-node", "./node_modules/knex/bin/cli.js", ...args],
  {
    stdio: "inherit",
    shell: true,
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status || 0);
