# Production release gate

Before creating a production build, configure the production API and map provider and run:

    npm run release:check

The check rejects:
- localhost/emulator API URLs,
- non-HTTPS API URLs,
- MapLibre demo tiles,
- non-HTTPS map styles,
- default development admin tokens,
- the default local PostgreSQL connection.

Recommended production separation:

- Mobile build: EXPO_PUBLIC_GOAR_API_URL, EXPO_PUBLIC_GOAR_MAP_STYLE_URL.
- API host only: GOAR_ADMIN_TOKEN, DATABASE_URL.
- Never expose database credentials or admin tokens through EXPO_PUBLIC_* variables.

A production store release should also wait for the physical-device acceptance criteria in docs/FIELD_TEST_PLAN.md and docs/ANDROID_FIELD_TEST.md.

## API production hardening

Configure:
- `GOAR_ALLOWED_ORIGINS` as a comma-separated allowlist for browser/web origins,
- `GOAR_RATE_LIMIT_PER_MINUTE`,
- `GOAR_MAX_BODY_BYTES`,
- `GOAR_TELEMETRY_RETENTION_DAYS`,
- `GOAR_DIAGNOSTIC_RETENTION_DAYS`.

Deployment health endpoints:
- `GET /health` — process liveness,
- `GET /ready` — storage/database readiness.

Run `npm run retention:cleanup` on a scheduled production job.

The API applies no-store/security headers, request IDs, per-IP rate limiting, JSON body-size limits and constant-time admin bearer-token verification.

## Containerized API

Build the API image:

    docker build -t goar-api ./server

Run it with file storage for a smoke test:

    docker run --rm -p 8787:8787 \
      -e GOAR_ADMIN_TOKEN=replace-me \
      -e GOAR_ALLOWED_ORIGINS=https://app.example.com \
      goar-api

For production, also configure `DATABASE_URL` for PostgreSQL/PostGIS.

Verify:

    curl http://localhost:8787/health
    curl http://localhost:8787/ready

Run the end-to-end API smoke test from the repository root:

    npm run test:api

The smoke test launches the API with isolated file storage and verifies health/readiness, authenticated metrics, CORS, mapping write/read, demo ticket lookup, telemetry, diagnostics and request-size rejection.
