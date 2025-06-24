import { observer } from "mobx-react-lite";
import { SimulationState } from "./simulation";
import { Ring } from "./Ring";
import { Plot } from "./Plot";
import * as d3 from "d3";
import { useState } from "react";

export interface HistoryEntry {
    time: number,
    activity: number[],
    inputAngle: number,
    inputStrength: number,
}

interface Props {
    state: SimulationState,
    history: HistoryEntry[],
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
    const [hovering, setHovering] = useState<number | undefined>(undefined);

    return (
        <div className="flex flex-row h-full w-full">
            <div className="flex-1/2 flex flex-col w-full">
            </div>
            <div className="flex-1/2 flex flex-col w-full">
                <div className="flex-1/2 overflow-hidden">
                    <Plot yExtent={[0, 1]}
                        xExtent={d3.extent(props.history, d => d.time) as [number, number]}
                        curves={props.state.activity.map((_, i) => props.history.map(d => [d.time, d.activity[i]]))}
                        colors={props.state.activity.map((_, i) => hovering !== undefined && hovering !== i ? "rgba(255, 255, 255, 0.2)" : "white")}
                        />
                </div>
                <div className="flex-1/2 overflow-hidden">
                    <Plot yExtent={[-Math.PI, Math.PI]}
                        xExtent={d3.extent(props.history, d => d.time) as [number, number]}
                        curves={[
                            props.history.map(d => [d.time, decodeAngle(d.activity)]),
                            props.history.map(d => [d.time, d.inputAngle]),
                            //props.history.map(d => [d.time, d.inputStrength]),
                        ]}
                        colors={[
                            "white", "gray"
                        ]}/>
                </div>
            </div>
        </div>
    )
});
