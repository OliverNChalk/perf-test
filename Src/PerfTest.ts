import Benchmark from "benchmark";
import StdOutAppender from "./StdOutAppender";

const GlobalPrefix: string = "xXx_PerfTest_xXx";

export type TPerfTestConfig =
{
    Name: string;
    Function: Function;
    FunctionReturnsPromise?: true | undefined;
    State?: TKeyValue[];
    Console?: boolean;
};

export type TKeyValue =
{
    Key: string;
    Value: any;
};

export type TTestResult =
{
    Name: string;
    Hz: {
        Mean: number;
        Deviation: number;
    };
    Time: {
        Mean: number;
        Deviation: number;
    };
};

export class PerfTest
{
    private readonly mBenchmarkJS: Benchmark;
    private readonly mConsoleEnabled: boolean;
    private readonly mGlobalKeys: string[] = [];
    private readonly mTestState: TKeyValue[] | undefined;
    private mTestResolve: (aValue: TTestResult) => void = undefined!;

    public constructor(aConfig: TPerfTestConfig)
    {
        this.mConsoleEnabled = aConfig.Console || false;
        this.mTestState = aConfig.State;

        const lSetupFunction: string | undefined = this.CreateSetUpFunction();
        const lTestedFunction: Function = this.CreateTestFunction(aConfig);

        this.mBenchmarkJS = new Benchmark(
            {
                name: aConfig.Name,
                setup: lSetupFunction,
                fn: lTestedFunction,
                onComplete: this.OnComplete.bind(this),
                defer: aConfig.FunctionReturnsPromise,
            },
        );
    }

    private CleanUpGlobalState(): void
    {
        for (let i: number = 0; i < this.mGlobalKeys.length; ++i)
        {
            delete(global[this.mGlobalKeys[i]]);
        }
    }

    private CreateSetUpFunction(): string | undefined
    {
        let lSetupFunction: string | undefined = undefined;
        if (this.mTestState !== undefined)
        {
            lSetupFunction = this.CreateSetUpString(this.mTestState);
        }

        return lSetupFunction;
    }

    private CreateSetUpString(aKeyValues: TKeyValue[]): string
    {
        let lFunctionString: string = "";

        for (let i: number = 0; i < aKeyValues.length; ++i)
        {
            const lState: TKeyValue = aKeyValues[i];
            lFunctionString += `var ${lState.Key} = ${(this.GenGlobalKey(lState))};\n`;
        }

        return lFunctionString;
    }

    private CreateTestFunction(aConfig: TPerfTestConfig): Function
    {
        let lTestedFunction: Function = aConfig.Function;
        if (aConfig.FunctionReturnsPromise)
        {
            lTestedFunction = function AsyncWrapper(deferred: any): void
            {
                aConfig.Function()
                    .then(() =>
                    {
                        deferred.resolve();
                    });
            };
        }

        return lTestedFunction;
    }

    private FormatBenchmarkResult(aCompletionEvent: Benchmark.Event, lStandardDeviation: number): TTestResult
    {
        const lResult: TTestResult =
        {
            Name: aCompletionEvent.target.options.name || "UnNamedTest",
            Hz: {
                Mean: aCompletionEvent.target.hz!,
                Deviation: aCompletionEvent.target.hz! * lStandardDeviation,
            },
            Time: {
                Mean: aCompletionEvent.target.times!.period!,
                Deviation: aCompletionEvent.target.stats!.deviation,
            },
        };

        return lResult;
    }

    private GenGlobalKey(aKeyValue: TKeyValue): string
    {
        return GlobalPrefix + aKeyValue.Key;
    }

    private InjectGlobalState(aState: TKeyValue): void
    {
        const lGlobalId: string = this.GenGlobalKey(aState);

        if (global[lGlobalId] !== undefined)
        {
            console.warn({
                Message: "Overwriting global data!",
                UserKey: aState.Key,
                InternalKey: lGlobalId,
                ExistingValue: global[lGlobalId],
                NewValue: aState.Value,
            });
        }

        global[lGlobalId] = aState.Value;
        this.mGlobalKeys.push(lGlobalId);
    }

    private OnComplete(aCompletionEvent: Benchmark.Event): void
    {
        const lMeanTime: number = aCompletionEvent.target.times!.period!;
        const lTimeDeviation: number = aCompletionEvent.target.stats!.deviation;
        const lStandardDeviation: number = lTimeDeviation / lMeanTime;
        const lResult: TTestResult = this.FormatBenchmarkResult(aCompletionEvent, lStandardDeviation);

        this.mTestResolve(lResult);
        if (this.mConsoleEnabled)
        {
            StdOutAppender.WriteResult(lResult);
        }

        this.CleanUpGlobalState();
    }

    private SetUpState(aInjectedState: TKeyValue[]): void
    {
        for (let i: number = 0; i < aInjectedState.length; ++i)
        {
            this.InjectGlobalState(aInjectedState[i]);
        }
    }

    public Run(): Promise<TTestResult>
    {
        if (this.mTestState !== undefined)
        {
            this.SetUpState(this.mTestState);
        }

        return new Promise<TTestResult>((aResolve: (value: TTestResult) => void): void =>
        {
            this.mTestResolve = aResolve;
            this.mBenchmarkJS.run();
        });
    }
}
