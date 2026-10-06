# GoAR field-test release candidate

This repository state is the software release candidate for physical AR validation.

## Immutable code reference

Use the exact Git commit under test and record it with every field-test run.

Current baseline before this document was added:

`f0a12b358e4701998993b2373175338b276577d2`

Do not treat this as a public production release. It is a field-test candidate only.

## Required test evidence

For each device/run capture:

- Git commit SHA
- device model
- OS version
- ARCore / ARKit environment
- checkpoint used
- mapper hit type/confidence
- route length
- deliberate off-route event result
- checkpoint correction drift
- final measured seat error
- crash/tracking-loss notes
- uploaded diagnostic session ID

## Pass gate

A candidate is eligible for production-release review only after:

- Android ARCore test passes,
- iPhone ARKit test passes,
- five consecutive complete runs per platform,
- final seat error <= 0.75 m in the agreed test venue,
- reroute reaction <= 3 seconds,
- no wrong-floor arrivals,
- no critical/security CI failures,
- privacy/legal review completed,
- production API/map/EAS/signing credentials configured.

## After testing

Attach the measured results to GitHub Issue #5 and reference the tested commit SHA.
