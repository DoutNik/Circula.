export const serverUnavailableMessage =
  "El servidor está temporalmente ocupado o iniciándose. Esperá un momento e intentá nuevamente.";

// Only retry authentication exchanges rejected as unavailable, never bad
// credentials or arbitrary mutations. Google authentication runs just once.
export async function retryLogin(request, {
  onWaiting = () => {},
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  const delays = [2000, 4000, 8000, 10000, 10000, 10000];
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      if (error.response?.status !== 503 || attempt === delays.length) {
        throw error;
      }
      onWaiting();
      await sleep(delays[attempt]);
    }
  }
}
