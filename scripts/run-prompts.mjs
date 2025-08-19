import { readFile } from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
const sh = promisify(execFile);
const ROOT=process.cwd();
const manifest = JSON.parse(await readFile(join(ROOT,'prompts','MANIFEST.json'),'utf8'));
for (const file of manifest.sprintOrder) {
  const p = join(ROOT,'prompts',file);
  const prompt = await readFile(p,'utf8');

  // ここで Codex に投げて生成（あなたの実行環境で）
  // const output = await callCodex(prompt) // <- 実装は手元で

  // 生成済みの成果物を outPaths に配置した前提で PR を作成
  const branch = `feat/prompt-${file.replace(/\W+/g,'-')}`;
  const args = [
    'npx','ts-node','commit-and-pr.ts',
    '--branch', branch, '--base', 'main',
    '--title', `feat: ${file}`,
    '--body', `Generated from prompts/${file}`,
    '--paths', 'CHANGE_ME/output_file_paths'
  ];
  console.log(`> opening PR for ${file}`);
  const { stdout } = await sh(args[0], args.slice(1), { cwd: ROOT });
  console.log(stdout.trim());
}
