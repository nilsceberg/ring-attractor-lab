import { observer } from "mobx-react-lite";
import { randomActivity, SimulationState } from "./simulation";
import { PropsWithChildren } from "react";
import { action } from "mobx";

const Input = (props: PropsWithChildren<{ label: string }>) => {
    return <div>{props.label}: {props.children}</div>;
};

const Numeric = (props: { value: number, min: number, max: number, onChange: (value: any) => void }) => {
    return <input type="number" value={props.value} onChange={e => props.onChange(e.target.value)} max={props.max} min={props.min} />;
}

const Slider = (props: { value: number, min: number, max: number, onChange: (value: any) => void }) => {
    return <input type="range" value={props.value} onChange={e => props.onChange(e.target.value)} max={props.max} min={props.min} step={(props.max - props.min) / 100}/>;
}

interface Props {
    state: SimulationState,
}

export const Parameters = observer((props: Props) => {
    return (
        <div>
            <button onClick={action(() => props.state.activity = randomActivity(props.state.neurons))}>Randomize activity</button>
            <Input label="Time constant">
                <Numeric min={0.01} max={100} value={props.state.time_constant} onChange={action(value => props.state.time_constant = value)}/>
                <Slider min={-2} max={2} value={Math.log10(props.state.time_constant)} onChange={action(value => props.state.time_constant = Math.pow(10, value))}/>
            </Input>
        </div>
    )
});