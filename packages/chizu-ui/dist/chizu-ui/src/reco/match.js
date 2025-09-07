const tokenize = (s = '') => Array.from(new Set(s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/))).filter(Boolean);
const jaccard = (a, b) => {
    const A = new Set(a), B = new Set(b);
    const inter = [...A].filter(x => B.has(x)).length;
    const uni = new Set([...(a || []), ...(b || [])]).size || 1;
    return inter / uni;
};
export function computeMatches(left, right, opts = {}) {
    const tol = opts.amountTolerance ?? 1; // 1円単位まで一致を優遇
    const out = [];
    for (const L of left) {
        let best = null;
        const lt = tokenize(L.memo);
        for (const R of right) {
            const amountGap = Math.abs((L.amount ?? 0) - (R.amount ?? 0));
            const denom = Math.max(Math.abs(L.amount || 1), 1);
            const amtScore = 1 - Math.min(amountGap / denom, 1);
            const rt = tokenize(R.memo);
            const txtScore = jaccard(lt, rt);
            const score = (amountGap <= tol ? 1 : 0.7 * amtScore) + 0.3 * txtScore; // 0..1.3
            const candidate = {
                leftId: L.id, rightId: R.id, score,
                reason: [
                    `Δamount=${amountGap}`,
                    ...(txtScore > 0 ? [`jaccard=${txtScore.toFixed(2)}`] : []),
                ],
            };
            if (!best || candidate.score > best.score)
                best = candidate;
        }
        if (best)
            out.push(best);
    }
    return out.sort((a, b) => b.score - a.score);
}
