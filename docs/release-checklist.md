## v1.0 GA 前チェックリスト（RC→main）

- [ ] J-01 E2E 3本+安定化+perf DoD 緑
- [ ] J-02 Unit ~50本以上 緑
- [ ] J-03 `docs/testing.md` P95 Baseline 直近Runで更新済
- [ ] J-04 Ubuntu/Windows とも P95 < 150ms 緑
- [ ] PR 本文のチェック項目 ON（J-03/J-04）

## コマンド
```bash
pnpm -w install
pnpm -w run test:unit
pnpm -w run test:e2e:serve
pnpm -w run test:report
```

## タグ昇格

- RC→main をマージ
- git tag -a v1.0.0 -m "UI Builder v1.0.0 (GA)" && git push origin v1.0.0
- GitHub Release を生成（Release NotesにP95表のリンクとDoDを明記）

