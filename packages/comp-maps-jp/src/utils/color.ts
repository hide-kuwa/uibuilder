import type { VisitStatus } from '../types';
import type { JapanMapProps } from '../types';
export function colorOf(st: VisitStatus | undefined, p: JapanMapProps['palette']) {
  switch (st) { case 'visited': return p.visited; case 'lived': return p.lived;
    case 'passed': return p.passed; default: return p.none; }
}
