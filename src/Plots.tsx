import { observer } from "mobx-react-lite";
import { preferenceAngle, SimulationState, weightFunction } from "./simulation";
import { cellStyle, Ring } from "./Ring";
import { Plot } from "./Plot";
import * as d3 from "d3";
import { useState } from "react";
import { MAX_HISTORY_DURATION } from "./settings";
import { InputParameters } from "./Parameters";

export interface HistoryEntry {
    time: number,
    activity: number[],
    inputAngle: number,
    inputStrength: number,
}

interface Props {
    state: SimulationState,
    inputs: InputParameters,
    history: HistoryEntry[],
    highlight: number | undefined,
}

function decodeAngle(activity: number[]) {
    let vector = [0, 0];
    let delta = 2 * Math.PI / activity.length;
    for (let i=0; i<activity.length; ++i) {
        vector[0] += activity[i] * Math.cos(delta * i);
        vector[1] += activity[i] * Math.sin(delta * i);
    }
    return Math.atan2(vector[1], vector[0]);
}

export const Plots = observer((props: Props) => {
    const [min, max] = d3.extent(props.history, d => d.time) as [number, number];
    const timeExtent: [number, number] = [min, min + MAX_HISTORY_DURATION];

    const angles = d3.range(-Math.PI, Math.PI, 0.1);

    return (
        <div className="flex flex-row h-full w-full">
            <div className="flex-1/2 flex flex-col w-full">
                <div className="flex-1/2 overflow-hidden">
                    <Plot yExtent={[-1, 1]}
                        xExtent={[-Math.PI, Math.PI]}
                        curves={[angles.map(phi => [phi, weightFunction(0, phi, props.inputs.a, props.inputs.b)])]}
                        curveColors={["rgb(128, 128, 255)"]}
                        />
                </div>
                <div className="flex-1/2 overflow-hidden">
                    <Plot yExtent={[-Math.PI, Math.PI]}
                        xExtent={timeExtent}
                        curves={[
                            props.history.map(d => [d.time, decodeAngle(d.activity)]),
                            props.history.map(d => [d.time, d.inputAngle]),
                            //props.history.map(d => [d.time, d.inputStrength]),
                        ]}
                        curveColors={[
                            "white", "gray"
                        ]}/>
                </div>
            </div>
            <div className="flex-1/2 flex flex-col w-full">
                <div className="flex-1/2 overflow-hidden">
                    <Plot yExtent={[0, 1]}
                        xExtent={[-1, props.state.neurons]}
                        bars={[props.state.activity.map((a, i) => [i, a])]}
                        barStyles={[props.state.activity.map((a, i) => cellStyle(a, i, props.highlight))]}
                        />
                </div>
                <div className="flex-1/2 overflow-hidden">
                    <Plot yExtent={[0, 1]}
                        xExtent={timeExtent}
                        curves={props.state.activity.map((_, i) => props.history.map(d => [d.time, d.activity[i]]))}
                        curveColors={props.state.activity.map((_, i) => props.highlight !== undefined && props.highlight !== i ? "rgba(255, 255, 255, 0.2)" : "white")}
                        />
                </div>
            </div>
        </div>
    )
});
