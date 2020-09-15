# Perf Test - Javascript Performance Testing

### Known Issues
 - Benchmarks run slow when initial state is passed in, suspected issue in the `benchmark.js` library.
   - Could potentially edit functions to contain references directly to global variables instead of injecting them via the setup method.
   - Replace `benchmark.js` with a custom test runner long-term.

### Planned Features:
 - OnCycle (allow memory cleanup between cycles)
