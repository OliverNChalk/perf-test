import Benchmark from "benchmark";

const GlobalPrefix: string = "xXx_PerfTest_xXx";

export type TPerfTestConfig =
{
    Name: string;
    Function: Function;
    State?: TKeyValue[];
};

export type TKeyValue =
{
    Key: string;
    Value: any;
};

export default class PerfTest
{
    private readonly mGlobalKeys: string[] = [];
    private readonly mBenchmarkJS: Benchmark;

    public constructor(aConfig: TPerfTestConfig)
    {
        let lSetupFunction: string | undefined = undefined;
        if (aConfig.State !== undefined)
        {
            this.SetUpState(aConfig.State);
            lSetupFunction = this.CreateSetUpFunction(aConfig.State);
        }

        this.mBenchmarkJS = new Benchmark(
            {
                name: aConfig.Name,
                fn: aConfig.Function,
                setup: lSetupFunction,
                onComplete: this.OnComplete.bind(this),
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

    private CreateSetUpFunction(aKeyValues: TKeyValue[]): string
    {
        let lFunctionString: string = "";

        for (let i: number = 0; i < aKeyValues.length; ++i)
        {
            const lState: TKeyValue = aKeyValues[i];
            lFunctionString += `var ${lState.Key} = ${(this.GenGlobalKey(lState))};\n`;
        }

        return lFunctionString;
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
        // tslint:disable-next-line:no-console
        console.log(aCompletionEvent);
        this.CleanUpGlobalState();
    }

    private SetUpState(aInjectedState: TKeyValue[]): void
    {
        for (let i: number = 0; i < aInjectedState.length; ++i)
        {
            this.InjectGlobalState(aInjectedState[i]);
        }
    }

    public Run(): Promise<any>
    {
        return new Promise<any>((aResolve: (value: any) => void): void =>
        {
            this.mBenchmarkJS.run({ onComplete: aResolve });
        });
    }
}
