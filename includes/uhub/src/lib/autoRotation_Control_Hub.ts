type RotationEntry = {
  id: string;
  intervalMs: number;
  nextReadyAt: number;
  rotate: () => void;
  canRotate?: () => boolean;
};

const entries = new Map<string, RotationEntry>();
let timer: number | null = null;

function start() {
  if (timer !== null) return;
  timer = window.setInterval(() => {
    const now = Date.now();
    for (const entry of entries.values()) {
      if (entry.nextReadyAt > now) continue;
      if (entry.canRotate && !entry.canRotate()) continue;
      entry.nextReadyAt = now + entry.intervalMs;
      entry.rotate();
      break;
    }
  }, 3000);
}

export const autoRotation_Control_Hub = {
  register(id: string, intervalMs: number, rotate: () => void, canRotate?: () => boolean) {
    entries.set(id, { id, intervalMs, nextReadyAt: Date.now() + intervalMs, rotate, canRotate });
    start();
    return () => {
      entries.delete(id);
      if (entries.size === 0 && timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };
  },
};