import { observer } from "mobx-react-lite";
import { createWeights, randomActivity, SimulationState } from "./simulation";
import { PropsWithChildren } from "react";
import { action } from "mobx";
import { Pause, PlayArrow } from "@mui/icons-material";
import { STIMULI } from "./colors";

const Input = (props: PropsWithChildren<{ label: string }>) => {
    return <div className="flex flex-col m-2 w-full">
        <div className="whitespace-nowrap overflow-hidden overflow-ellipsis text-left content-center h-full pr-4 text-xs">{props.label}: </div>
        <div className="flex flex-row h-[30px]">
            {props.children}
        </div>
    </div>;
};

const Numeric = (props: { value: number, min: number, max: number, onChange: (value: any) => void }) => {
    return <input className="basis-0 grow-[0.8] pl-1" type="number" value={props.value.toPrecision(3)} onChange={e => props.onChange(parseFloat(e.target.value) || 0)} max={props.max.toPrecision(3)} min={props.min.toPrecision(3)} />;
}

const Slider = (props: { value: number, min: number, max: number, onChange: (value: any) => void }) => {
    return <input className="basis-0 grow-[3]" type="range" value={props.value} onChange={e => props.onChange(parseFloat(e.target.value) || 0)} max={props.max} min={props.min} step={(props.max - props.min) / 100}/>;
}

const Divider = (props: PropsWithChildren<{}>) => {
    return <div className="w-full ml-auto mr-auto text-center border-b-1 border-[#777] text-[#ccc] mb-2 mt-3">{props.children}</div>
}

export interface InputParameters {
    angleA: number,
    angleB: number,
    widthA: number,
    widthB: number,
    strengthA: number,
    strengthB: number,
    activeA: boolean,
    activeB: boolean,
    a: number,
    b: number,
}

interface Props {
    state: SimulationState,
    inputs: InputParameters,
}

export const Parameters = observer((props: Props) => {
    const weightAction = action((updater: (value: number) => void) => (value: number) => {
        updater(value);
        props.state.weights = createWeights(props.state.neurons, props.inputs.a, props.inputs.b);
    });

    return (
        <div className="p-10 pt-4">
            {/*<button onClick={action(() => props.state.activity = randomActivity(props.state.neurons))}>Randomize activity</button>*/}
            {/*<Divider>Simulation</Divider>*/}
            {/*<Input label="Neuronal time constant">
                <Numeric min={0.01} max={100} value={props.state.time_constant} onChange={action(value => props.state.time_constant = value)}/>
                <Slider min={-2} max={2} value={Math.log10(props.state.time_constant)} onChange={action(value => props.state.time_constant = Math.pow(10, value))}/>
            </Input>
            <Input label="Neuronal noise">
                <Numeric min={0.01} max={10} value={props.state.volatility} onChange={action(value => props.state.volatility = value)}/>
                <Slider min={-2} max={1} value={Math.log10(props.state.volatility)} onChange={action(value => props.state.volatility = Math.pow(10, value))}/>
            </Input>*/}

            <Divider><span style={{ color: STIMULI[0] }}>Stimulus A</span> <input type="checkbox" checked={props.inputs.activeA} onChange={action(_ => props.inputs.activeA = !props.inputs.activeA)}/></Divider>
            <Input label="Location (radians)">
                <Numeric min={-Math.PI} max={Math.PI} value={props.inputs.angleA} onChange={action(value => props.inputs.angleA = value)}/>
                <Slider min={-Math.PI} max={Math.PI} value={props.inputs.angleA} onChange={action(value => props.inputs.angleA = value)}/>
            </Input>
            <Input label="Width (radians)">
                <Numeric min={0} max={2*Math.PI} value={props.inputs.widthA} onChange={action(value => props.inputs.widthA = value)}/>
                <Slider min={0} max={2*Math.PI} value={props.inputs.widthA} onChange={action(value => props.inputs.widthA = value)}/>
            </Input>
            <Input label="Strength">
                <Numeric min={0} max={1} value={props.inputs.strengthA} onChange={action(value => props.inputs.strengthA = value)}/>
                <Slider min={0} max={1} value={props.inputs.strengthA} onChange={action(value => props.inputs.strengthA = value)}/>
            </Input>

            <Divider><span style={{ color: STIMULI[1] }}>Stimulus B</span> <input type="checkbox" checked={props.inputs.activeB} onChange={action(_ => props.inputs.activeB = !props.inputs.activeB)}/></Divider>
            <Input label="Location (radians)">
                <Numeric min={-Math.PI} max={Math.PI} value={props.inputs.angleB} onChange={action(value => props.inputs.angleB = value)}/>
                <Slider min={-Math.PI} max={Math.PI} value={props.inputs.angleB} onChange={action(value => props.inputs.angleB = value)}/>
            </Input>
            <Input label="Width (radians)">
                <Numeric min={0} max={2*Math.PI} value={props.inputs.widthB} onChange={action(value => props.inputs.widthB = value)}/>
                <Slider min={0} max={2*Math.PI} value={props.inputs.widthB} onChange={action(value => props.inputs.widthB = value)}/>
            </Input>
            <Input label="Strength">
                <Numeric min={0} max={1} value={props.inputs.strengthB} onChange={action(value => props.inputs.strengthB = value)}/>
                <Slider min={0} max={1} value={props.inputs.strengthB} onChange={action(value => props.inputs.strengthB = value)}/>
            </Input>

            <Divider/>
            <div className="w-full text-center">{props.state.paused ? <Pause fontSize="large"/> : <PlayArrow fontSize="large"/>} {props.state.time.toFixed(2)} s</div>

            {/*<Divider>Connectivity</Divider>
            <Input label="a">
                <Numeric min={-1} max={1} value={props.inputs.a} onChange={weightAction(value => props.inputs.a = value)}/>
                <Slider min={-1} max={1} value={props.inputs.a} onChange={weightAction(value => props.inputs.a = value)}/>
            </Input>
            <Input label="b">
                <Numeric min={-1} max={1} value={props.inputs.b} onChange={weightAction(value => {console.log(value); props.inputs.b = value})}/>
                <Slider min={-1} max={1} value={props.inputs.b} onChange={weightAction(value => props.inputs.b = value)}/>
            </Input>*/}
        </div>
    )
});