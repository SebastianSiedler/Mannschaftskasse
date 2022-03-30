const { performance } = require('perf_hooks');

export const measureTime = async <Data>(method: () => Promise<Data>) => {
  const startTime = performance.now();
  const data = await method();
  const endTime = performance.now();

  return {
    data,
    duration: `${(endTime - startTime).toFixed(2)}ms`,
  };
};
