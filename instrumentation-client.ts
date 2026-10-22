// This file configures the initialization of Sentry on the client.
// In development, Sentry client initialization is skipped for near-instant rendering.

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://ca23dc004ea8c51440b727c62656ae3e@o4512111069954048.ingest.de.sentry.io/4512111070281808",
    integrations: [Sentry.replayIntegration()],
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export const onRouterTransitionStart =
  process.env.NODE_ENV === "production"
    ? Sentry.captureRouterTransitionStart
    : undefined;
