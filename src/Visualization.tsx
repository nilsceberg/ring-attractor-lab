import { observer } from "mobx-react-lite";
import { SimulationState } from "./simulation";
import { Ring } from "./Ring";
import { Plot } from "./Plot";

interface Props {
    state: SimulationState,
    history: [number, number[]][],
}

export const Visualization = observer((props: Props) => {
    return (
        <div className="flex flex-col h-full">
            <div className="basis-0 grow overflow-hidden">
                <Ring state={props.state}/>
            </div>
            <div className="basis-0 grow overflow-hidden">
                <Plot state={props.state} history={props.history}/>
            </div>
        </div>
    )
});
