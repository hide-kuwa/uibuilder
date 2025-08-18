import { spawnSync } from "node:child_process";
import process from "node:process";

function run(cmd: string, args: string[]) {
  const res = spawnSync(cmd, args, { stdio: "inherit" });
  if (res.status !== 0) {
    process.exit(res.status === null ? 1 : res.status);
  }
}

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const branch = getArg("branch");
  const base = getArg("base");
  const title = getArg("title");
  const body = getArg("body") || "";
  const pathsArg = getArg("paths") || "";

  if (!branch || !base || !title) {
    console.error("Missing required arguments: --branch, --base, --title");
    process.exit(1);
  }

  const paths = pathsArg.split(",").filter(Boolean);

  run("git", ["checkout", "-B", branch]);
  for (const p of paths) {
    run("git", ["add", p]);
  }
  run("git", ["commit", "-m", title]);
  run("git", ["push", "--force", "-u", "origin", branch]);

  const token = process.env.GH_TOKEN;
  const repo = process.env.REPO;
  const owner = process.env.OWNER;
  if (!token || !repo || !owner) {
    console.error("Missing GH_TOKEN, REPO, or OWNER environment variable");
    process.exit(1);
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "commit-and-pr-script",
      },
      body: JSON.stringify({ title, head: branch, base, body }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`Failed to create PR: ${response.status} ${text}`);
    process.exit(1);
  }

  const data = (await response.json()) as { html_url?: string };
  if (data.html_url) {
    console.log(data.html_url);
  } else {
    console.error("PR created but no URL returned");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
