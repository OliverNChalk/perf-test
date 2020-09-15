import type { TestInterface } from "ava";
import anyTest, { ExecutionContext } from "ava";
import { PerfTest, TTestResult } from "../Src/PerfTest";

type TTestContext = {};
const test: TestInterface<TTestContext> = anyTest as TestInterface<TTestContext> ;

test.serial("Sync Function", async(t: ExecutionContext<TTestContext>): Promise<void> =>
{
    t.timeout(30000);   // 30s between assertions
    const lTestData: number[] = [];
    for (let i: number = 0; i < 10_000; ++i)
    {
        lTestData.push(i);
    }

    function MapAssigned(): void
    {
        // tslint:disable-next-line
        const lTestResult: string[] = lTestData.map((aNum: number) => aNum.toString());
    }

    function MapDeclared(): void
    {
        // tslint:disable-next-line
        const lTestResult: string[] = lTestData.map(function(aNum: number): string
        {
            return aNum.toString();
        });
    }

    const lMapAssigned: PerfTest = new PerfTest(
        {
            Name: "MapAssigned",
            Function: MapAssigned,
            State: [
                { Key: "lTestData", Value: lTestData },
            ],
        },
    );

    const lMapDeclared: PerfTest = new PerfTest(
        {
            Name: "MapDeclared",
            Function: MapDeclared,
            State: [
                { Key: "lTestData", Value: lTestData },
            ],
        },
    );

    const lResults: TTestResult[] = [];
    lResults.push(await lMapAssigned.Run());
    lResults.push(await lMapDeclared.Run());

    t.is(lResults.length, 2);
    t.is(lResults[0].Name, "MapAssigned");
    t.is(typeof lResults[0].Time.Mean, "number");
    t.is(typeof lResults[0].Time.Deviation, "number");
    t.is(typeof lResults[0].Hz.Mean, "number");
    t.is(typeof lResults[0].Hz.Deviation, "number");
    t.is(typeof lResults[0].Hz.Deviation, "number");
    t.is(lResults[1].Name, "MapDeclared");
    t.is(typeof lResults[1].Time.Mean, "number");
    t.is(typeof lResults[1].Time.Deviation, "number");
    t.is(typeof lResults[1].Hz.Mean, "number");
    t.is(typeof lResults[1].Hz.Deviation, "number");
    t.is(typeof lResults[1].Hz.Deviation, "number");
});
