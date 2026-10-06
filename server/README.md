# GoAR MVP API

A dependency-free Node API for the MVP sync contract.

## Run

```bash
GOAR_ADMIN_TOKEN=change-me node server/index.mjs
```

Defaults to port 8787.

## Routes

- `GET /health`
- `GET /tickets/ticket-demo-001`
- `GET /venues/:venueId/mapping`
- `PUT /venues/:venueId/mapping` with `Authorization: Bearer $GOAR_ADMIN_TOKEN`

Mappings are persisted as JSON under `server/data/`. Replace this storage adapter with PostgreSQL/PostGIS for multi-venue production deployment without changing the mobile sync interface.
