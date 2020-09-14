import { TTestResult } from "./PerfTest";

export default class StdOutAppender
{
    private static FormatResult(aTestResult: TTestResult): string
    {
        const lPercentDeviation: number = aTestResult.Hz.Deviation / aTestResult.Hz.Mean * 100;
        const lOutput: string = aTestResult.Name
         + " | " + `${aTestResult.Hz.Mean} (±${lPercentDeviation.toFixed(3)}%) ops/s`
         + " | " + `${(aTestResult.Time.Mean * 1000).toFixed(6)} ms average time`;

        return lOutput;
    }

    public static WriteResult(aTestResult: TTestResult): void
    {
        process.stdout.write(this.FormatResult(aTestResult) + "\n");
    }
}
