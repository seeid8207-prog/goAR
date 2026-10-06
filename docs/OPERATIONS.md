# GoAR production operations

## Health

- `GET /health`: liveness.
- `GET /ready`: database/storage readiness.
- `GET /metrics`: authenticated runtime metrics.

## Metrics endpoint

Send the admin bearer token:

    Authorization: Bearer <GOAR_ADMIN_TOKEN>

The endpoint returns JSON with:
- process uptime,
- Node version,
- resident memory,
- heap used/total,
- storage mode,
- process ID,
- timestamp.

Do not expose this endpoint publicly without ingress/network controls in addition to bearer authentication.

## Retention

Run periodically:

    npm run retention:cleanup

Recommended starting schedule: once per day.

## Alerts

Suggested production alerts:
- /ready returns non-200 for 2 consecutive checks,
- API 5xx rate exceeds 2% for 5 minutes,
- memory usage remains above deployment limit for 10 minutes,
- database connection saturation,
- field-test/production crash rate increase,
- AR arrival error exceeds the accepted venue threshold.

## Logs

Every API response includes an `x-request-id`. Log this identifier with server-side failures and propagate it through upstream reverse proxies where possible.
