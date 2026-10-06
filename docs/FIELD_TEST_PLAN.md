# GoAR field test plan

## Devices
Test at least one supported ARCore Android device and one ARKit iPhone.

## Physical setup
Use a short venue route with:
- one checkpoint,
- one straight corridor,
- one turn,
- one floor transition if available,
- one mapped row,
- at least 10 seats.

Measure checkpoint and seat positions independently with a tape/laser measure so GoAR error can be compared to a physical reference.

## Runs
Perform at least five runs per device:
1. fresh app launch,
2. checkpoint calibration,
3. navigate the route,
4. deliberately deviate by >5 m once,
5. return to route,
6. finish at the destination.

Repeat two runs after force-closing/reopening the app.

## Record
For every run record:
- localization time,
- arrival error in meters,
- max visible AR drift,
- reroute latency,
- wrong-floor incidents,
- checkpoint rescan count,
- tracking-loss count.

## MVP targets
- checkpoint localization: <= 0.5 m error
- seat arrival: <= 0.75 m error
- reroute reaction: <= 3 s after confirmed deviation
- zero wrong-floor arrivals
- no crash across five consecutive runs

## Failure rule
Do not publish the app as production-ready if seat arrival error exceeds 1.5 m or the AR route visibly diverges from the real corridor after checkpoint calibration.
