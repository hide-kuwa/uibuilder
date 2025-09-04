export type RenderMetric = {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
};

class PerfMetrics {
  commitCount = 0;
  renderTime = 0;
  logs: RenderMetric[] = [];

  onRender = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    this.commitCount += 1;
    this.renderTime += actualDuration;
    this.logs.push({ id, phase, actualDuration, baseDuration, startTime, commitTime });
  };

  reset() {
    this.commitCount = 0;
    this.renderTime = 0;
    this.logs = [];
  }
}

export const perfMetrics = new PerfMetrics();
