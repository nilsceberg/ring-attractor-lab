import { observer } from "mobx-react-lite";
import { SimulationState } from "./simulation";
import { Ring } from "./Ring";

interface Props {
    state: SimulationState,
}

export const Visualization = observer((props: Props) => {
    return (
        <div className="flex flex-col h-full">
            <div className="basis-0 grow overflow-hidden">
                <Ring state={props.state}/>
            </div>
        </div>
    )
});
