/* tslint:disable */
import { PerfTest, TTestResult } from "../Src/PerfTest";

const lTestData: number[] = [];
for (let i: number = 0; i < 10_000; ++i)
{
    lTestData.push(i);
}

function MapAssigned(): void
{
    const lTestResult: string[] = lTestData.map((aNum: number) => aNum.toString());
}

function MapDeclared(): void
{
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

async function RunTests(): Promise<void>
{
    const lResults: TTestResult[] = [];
    lResults.push(await lMapAssigned.Run());
    await new Promise((resolve: () => void): void => { setTimeout(resolve, 1000); });
    lResults.push(await lMapDeclared.Run());

    console.log(lResults);
}

RunTests();
