/* tslint:disable */
import Benchmark from "benchmark";
import { performance } from "perf_hooks";

const lTestData: number[] = [];
for (let i: number = 0; i < 1_000; ++i)
{
    lTestData.push(i);
}

function SyncCompute(): void
{
    const lResult: string[] = lTestData.map((aData: number) => (aData + Math.random()).toString());
}

// @ts-ignore
global.lTestData = lTestData;

const lBenchNoSetup: any = new Benchmark(
    "SyncCompute",
    {
        fn: SyncCompute,
        onComplete: (aAny: Benchmark.Event): void =>
        {
            console.log(aAny.target.hz, "ops/s", "NoSetup");
        },
    },
);

const lBenchDeclaredSetup: any = new Benchmark(
    "SyncCompute",
    {
        fn: SyncCompute,
        setup: function SetUp(): void {},
        onComplete: (aAny: Benchmark.Event): void =>
        {
            console.log(aAny.target.hz, "ops/s", "DeclaredSetup");
        },
    },
);

const lBenchAssignedSetup: any = new Benchmark(
    "SyncCompute",
    {
        fn: SyncCompute,
        setup: (): void => {},
        onComplete: (aAny: Benchmark.Event): void =>
        {
            console.log(aAny.target.hz, "ops/s", "AssignedSetup");
        },
    },
);

function customBench(times: number, title: string, exec: () => void): void
{
    const lStart: number = performance.now();
    for (let i: number = 0; i < times; i++)
    {
        exec();
    }
    const lTook: number = performance.now() - lStart;

    process.stdout.write([
        (1000 / lTook) * times, "ops/s",
        title,
        lTook.toLocaleString(undefined, {maximumFractionDigits: 17}), "ms,",
        process.memoryUsage().rss / 1024 / 1024, "MB memory",
    ].join(" ") + "\n");
}

async function runTests(): Promise<void>
{
    customBench(5_000, "SyncCompute", SyncCompute);
    await new Promise((resolve: () => void): void => { setTimeout(resolve, 200); });
    lBenchNoSetup.run();
    await new Promise((resolve: () => void): void => { setTimeout(resolve, 200); });
    lBenchDeclaredSetup.run();
    await new Promise((resolve: () => void): void => { setTimeout(resolve, 200); });
    lBenchAssignedSetup.run();
}

runTests();
