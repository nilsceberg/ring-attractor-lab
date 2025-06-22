import { observer } from "mobx-react-lite";
import { SimulationState } from "./simulation";
import { line } from "d3";

export const Plot = observer((props: { state: SimulationState, history: [number, number[]][] }) => {
    const lines = line(d => d[0] - props.history[0][0], d => (d as any)[1][0]);

    return (
        <svg className="w-full h-full" viewBox="0 -1 10 2">
            <path fill="transparent" stroke="white" strokeWidth="0.1" d={lines(props.history as any) as string}/>
        </svg>
    );
});

