import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

async function main() {
  const snapshotsDir = path.join(process.cwd(), 'snapshots');
  const outDir = path.join(process.cwd(), 'out', 'pages');
  await mkdir(outDir, { recursive: true });
  let pageIds: string[] = [];
  try {
    pageIds = await readdir(snapshotsDir);
  } catch {
    console.warn('no snapshots directory');
    return;
  }
  for (const pageId of pageIds) {
    const pageDir = path.join(snapshotsDir, pageId);
    let files: string[] = [];
    try {
      files = await readdir(pageDir);
    } catch {
      continue;
    }
    const timestamps = files
      .filter((f) => f.endsWith('.json'))
      .map((f) => parseInt(f.replace(/\.json$/, ''), 10))
      .filter((n) => !isNaN(n))
      .sort((a, b) => b - a);
    if (timestamps.length === 0) continue;
    const latestFile = path.join(pageDir, `${timestamps[0]}.json`);
    try {
      const text = await readFile(latestFile, 'utf8');
      const data = JSON.parse(text);
      const snapshot = data.snapshot ?? data;
      const outFile = path.join(outDir, `${pageId}.json`);
      await writeFile(outFile, JSON.stringify(snapshot, null, 2), 'utf8');
      console.log(`exported ${pageId}`);
    } catch (err) {
      console.error(`failed to export ${pageId}`, err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
