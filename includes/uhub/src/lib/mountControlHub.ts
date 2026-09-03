type MountTask = {
  id: string;
  priority: number;
  sequence: number;
  task: () => Promise<void>;
  cancelled: boolean;
};

const pending: MountTask[] = [];
let activeCount = 0;
let sequence = 0;

function drain() {
  while (activeCount < 2 && pending.length) {
    pending.sort((left, right) => left.priority - right.priority || left.sequence - right.sequence);
    const next = pending.shift();
    if (!next || next.cancelled) continue;
    activeCount += 1;
    next.task().catch(() => undefined).finally(() => {
      activeCount -= 1;
      drain();
    });
  }
}

export const mountControlHub = {
  enqueue(id: string, task: () => Promise<void> | void, priority = 10) {
    const entry: MountTask = {
      id,
      priority,
      sequence: sequence++,
      task: async () => { await task(); },
      cancelled: false,
    };
    pending.push(entry);
    drain();
    return () => { entry.cancelled = true; };
  },
};