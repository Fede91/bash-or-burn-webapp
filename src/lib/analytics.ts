import type { PostHog } from 'posthog-js';
import type { Verdict } from './gauge';

export type ShareMethod = 'native' | 'x' | 'linkedin' | 'copy';
export type CtaLocation = 'nav' | 'footer' | 'cta';

export interface AnalyticsEvents {
  wizard_started: undefined;
  question_answered: { step_index: number; step_total: number };
  verdict_reached: { verdict: Verdict };
  result_shared: { verdict: Verdict; method: ShareMethod };
  cta_clicked: { location: CtaLocation };
}

const key = (): string => import.meta.env.VITE_POSTHOG_KEY?.trim() ?? '';

let client: Promise<PostHog> | null = null;

export function initAnalytics(): void {
  const apiKey = key();
  if (client || !apiKey) return;
  // Lazy import keeps posthog-js out of the main bundle.
  client = import('posthog-js').then(({ default: posthog }) => {
    posthog.init(apiKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || undefined,
      persistence: 'memory',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_surveys: true,
      disable_external_dependency_loading: true,
      person_profiles: 'identified_only',
      respect_dnt: true,
    });
    return posthog;
  });
  client.catch(() => {
    // analytics must never break the UI
  });
}

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  ...[props]: AnalyticsEvents[E] extends undefined ? [] : [AnalyticsEvents[E]]
): void {
  client
    ?.then((posthog) => posthog.capture(event, props))
    .catch(() => {
      // analytics must never break the UI
    });
}
