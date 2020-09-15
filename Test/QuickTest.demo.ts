/* tslint:disable */
import { PerfTest } from "../Src/PerfTest";

const lStartArray: string[] = [];

for (let i: number = 0; i < 10_000; ++i)
{
    lStartArray.push(`MyTestString${i}`);
}

function TestFunc(): void
{
    const lResult: string[] = lStartArray.map((aString: string) => { return aString + "_append"; });
}

const lBench: PerfTest = new PerfTest(
    {
        Name: "Array.map",
        Function: TestFunc,
        State: [ { Key: "lStartArray", Value: lStartArray } ],
        Console: true,
    },
);

function TestFunc2(): Promise<void>
{
    return new Promise((aResolve: () => void) =>
    {
        setTimeout(() => { aResolve(); }, 25);
    });
}

const lBench2: PerfTest = new PerfTest(
    {
        Name: "setTimeout25",
        Function: TestFunc2,
        FunctionReturnsPromise: true,
        Console: true,
    },
);

async function main(): Promise<void>
{
    const lResult = await lBench.Run();
    console.log("1 DONE:");
    console.log(lResult);

    const lResult2 = await lBench2.Run();
    console.log("2 DONE:");
    console.log(lResult2);
}

main();
