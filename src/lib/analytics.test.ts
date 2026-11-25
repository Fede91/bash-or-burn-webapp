import posthog from 'posthog-js';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

vi.mock('posthog-js', () => ({ default: { init: vi.fn(), capture: vi.fn() } }));

async function load() {
  vi.resetModules();
  return import('./analytics');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('analytics without a key', () => {
  it('never initialises or captures', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const { initAnalytics, track } = await load();
    initAnalytics();
    expect(() => track('wizard_started')).not.toThrow();
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });
});

describe('analytics with a key', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
    vi.stubEnv('VITE_POSTHOG_HOST', 'https://eu.i.posthog.com');
  });

  it('initialises once with the privacy config', async () => {
    const { initAnalytics } = await load();
    initAnalytics();
    initAnalytics();
    await flush();
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.init).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        api_host: 'https://eu.i.posthog.com',
        persistence: 'memory',
        autocapture: false,
        capture_pageview: false,
      }),
    );
  });

  it('captures events with their props', async () => {
    const { initAnalytics, track } = await load();
    initAnalytics();
    track('question_answered', { step_index: 2, step_total: 7 });
    await flush();
    expect(posthog.capture).toHaveBeenCalledWith('question_answered', {
      step_index: 2,
      step_total: 7,
    });
  });

  it('swallows capture errors', async () => {
    vi.mocked(posthog.capture).mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const { initAnalytics, track } = await load();
    initAnalytics();
    expect(() => track('wizard_started')).not.toThrow();
    await flush();
    expect(posthog.capture).toHaveBeenCalledTimes(1);
  });
});
