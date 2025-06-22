import { observer } from "mobx-react-lite";
import { SimulationState } from "./simulation";
import { Ring } from "./Ring";
import { Plot } from "./Plot";
import * as d3 from "d3";

interface Props {
    state: SimulationState,
    history: [number, number[]][],
}

function decodeAngle(activity: number[]) {
    let vector = [0, 0];
    let delta = 2 * Math.PI / activity.length;
    for(let i=0; i<activity.length; ++i) {
        vector[0] += activity[i] * Math.cos(delta * i);
        vector[1] += activity[i] * Math.sin(delta * i);
    }
    return Math.atan2(vector[1], vector[0]);
}

export const Visualization = observer((props: Props) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1/2 overflow-hidden">
                <Ring state={props.state}/>
            </div>
            <div className="flex-1/4 overflow-hidden">
                <Plot yExtent={[0, 1]} xExtent={d3.extent(props.history, d => d[0])} curves={[props.history.map(d => [d[0], d[1][0]])]}/>
            </div>
            <div className="flex-1/4 overflow-hidden">
                <Plot yExtent={[-Math.PI, Math.PI]} xExtent={d3.extent(props.history, d => d[0])} curves={[props.history.map(d => [d[0], decodeAngle(d[1])])]}/>
            </div>
        </div>
    )
});
