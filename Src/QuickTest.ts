/* tslint:disable */
import PerfTest from "./PerfTest";

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
    },
);

lBench.Run()
    .then((aAny: any) =>
    {
        console.log("DONE:");
        console.log(aAny);
        console.log(lBench["mBenchmarkJS"]);
    });
