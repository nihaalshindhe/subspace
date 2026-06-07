const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retry = async (fn, retries = 3, baseDelay = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2,attempt);
      console.log(`Attempt ${attempt} failed. Retrying in ${delay} ms...`);
      await sleep(delay);
    }
  }
};

module.exports = retry;