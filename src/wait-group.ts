export default function getWaitGroup(timeoutMs = 30_000) {
  // eslint-disable-next-line no-unused-vars
  let cancel!: (reason: any) => void;
  let done!: () => void;

  const promise = new Promise<void>((resolve, reject) => {
    done = resolve;
    cancel = reject;
    setTimeout(() => {
      const error = new Error(`Failed to start within ${timeoutMs / 1_000} seconds`);
      reject(error);
    }, timeoutMs);
  });
  return { promise, done, cancel };
}
