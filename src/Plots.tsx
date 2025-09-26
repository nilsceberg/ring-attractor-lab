import { observer } from "mobx-react-lite";
import { decodeAngle, preferenceAngle, SimulationState, Stimulus, weightFunction, wrapAngle } from "./simulation";
import { cellStyle, Ring } from "./Ring";
import { ActivitySnapshot } from "./ActivitySnapshot";
import * as d3 from "d3";
import { useState } from "react";
import { MAX_HISTORY_DURATION } from "./settings";
import { InputParameters } from "./Parameters";
import { ActivityHistory } from "./ActivityHistory";
import * as colors from "./colors";
import { Legend, LegendState } from "./Legend";

export interface HistoryEntry {
    time: number,
    activity: number[],
    stimuli: Stimulus[],
}

interface Props {
    state: SimulationState,
    inputs: InputParameters,
    history: HistoryEntry[],
    highlight: number | undefined,
}

export const Plots = observer((props: Props) => {
    const [legendState, setLegendState] = useState<LegendState>({
        heatmap: true,
        pva: true,
        stimulusA: true,
        stimulusB: true,
    });

    const now = props.state.time;
    const [min, max] = d3.extent(props.history, d => d.time) as [number, number];
    //const timeExtent: [number, number] = [min, min + MAX_HISTORY_DURATION];
    const timeExtent: [number, number] = [-MAX_HISTORY_DURATION, 0];

    const angles = d3.range(-Math.PI, Math.PI, 0.1);
    const fieldOffset = Math.PI / props.state.neurons;

    const STIMULI = [0, 1];

    const curveColors = ["white"].concat(colors.STIMULI);

    return (
        <div className="flex flex-col w-full h-full p-4">
            <div className="flex-1/2 overflow-hidden">
                <ActivitySnapshot yExtent={[0, 1]}
                    xExtent={[-1, props.state.neurons]}
                    bars={[props.state.activity.map((a, i) => [i, a])]}
                    barStyles={[props.state.activity.map((a, i) => cellStyle(a, i, props.highlight))]}
                    />
            </div>
            <div className="flex-1/2 overflow-hidden">
                <ActivityHistory yExtent={[-Math.PI - fieldOffset, Math.PI - fieldOffset]}
                    state={props.state}
                    xExtent={timeExtent}
                    history={props.history}
                    legend={legendState}
                    curves={
                        [
                            props.history.map(d => [d.time - now, wrapAngle(decodeAngle(d.activity), Math.PI / props.state.neurons)] as [number, number])
                        ].concat(STIMULI.map((_, index) => props.history.map(d => [d.time - now, wrapAngle(d.stimuli[index].location, fieldOffset)] as [number, number])))
                    }
                    curveColors={curveColors}
                    />
            </div>
            <Legend state={legendState} updateState={setLegendState} colors={curveColors}/>
        </div>
    )
});
