import { observer } from "mobx-react-lite";
import { randomActivity, SimulationState } from "./simulation";
import { PropsWithChildren } from "react";
import { action } from "mobx";

const Input = (props: PropsWithChildren<{ label: string }>) => {
    return <div className="flex flex-row m-2 h-[30px]">
        <div className="basis-0 grow-1 whitespace-nowrap overflow-hidden overflow-ellipsis text-right content-center h-full pr-4">{props.label}: </div>
        {props.children}
    </div>;
};

const Numeric = (props: { value: number, min: number, max: number, onChange: (value: any) => void }) => {
    return <input className="basis-0 grow-[0.8] pl-1" type="number" value={props.value.toPrecision(3)} onChange={e => props.onChange(parseFloat(e.target.value) || 0)} max={props.max.toPrecision(3)} min={props.min.toPrecision(3)} />;
}

const Slider = (props: { value: number, min: number, max: number, onChange: (value: any) => void }) => {
    return <input className="basis-0 grow-[3]" type="range" value={props.value} onChange={e => props.onChange(parseFloat(e.target.value) || 0)} max={props.max} min={props.min} step={(props.max - props.min) / 100}/>;
}

export interface InputParameters {
    angle: number,
    strength: number,
    a: number,
    b: number,
}

interface Props {
    state: SimulationState,
    inputs: InputParameters,
}

export const Parameters = observer((props: Props) => {
    return (
        <div className="p-10 pt-20">
            {/*<button onClick={action(() => props.state.activity = randomActivity(props.state.neurons))}>Randomize activity</button>*/}
            <Input label="Time constant">
                <Numeric min={0.01} max={100} value={props.state.time_constant} onChange={action(value => props.state.time_constant = value)}/>
                <Slider min={-2} max={2} value={Math.log10(props.state.time_constant)} onChange={action(value => props.state.time_constant = Math.pow(10, value))}/>
            </Input>
            <Input label="Noise">
                <Numeric min={0.01} max={10} value={props.state.volatility} onChange={action(value => props.state.volatility = value)}/>
                <Slider min={-2} max={1} value={Math.log10(props.state.volatility)} onChange={action(value => props.state.volatility = Math.pow(10, value))}/>
            </Input>
            <Input label="Compass angle">
                <Numeric min={-Math.PI} max={Math.PI} value={props.inputs.angle} onChange={action(value => props.inputs.angle = value)}/>
                <Slider min={-Math.PI} max={Math.PI} value={props.inputs.angle} onChange={action(value => props.inputs.angle = value)}/>
            </Input>
            <Input label="Compass strength">
                <Numeric min={0} max={1} value={props.inputs.strength} onChange={action(value => props.inputs.strength = value)}/>
                <Slider min={0} max={1} value={props.inputs.strength} onChange={action(value => props.inputs.strength = value)}/>
            </Input>
            <Input label="a">
                <Numeric min={-1} max={1} value={props.inputs.a} onChange={action(value => props.inputs.a = value)}/>
                <Slider min={-1} max={1} value={props.inputs.a} onChange={action(value => props.inputs.a = value)}/>
            </Input>
            <Input label="b">
                <Numeric min={-1} max={1} value={props.inputs.b} onChange={action(value => {console.log(value); props.inputs.b = value})}/>
                <Slider min={-1} max={1} value={props.inputs.b} onChange={action(value => props.inputs.b = value)}/>
            </Input>
        </div>
    )
});