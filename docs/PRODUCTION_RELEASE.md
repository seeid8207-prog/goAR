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
