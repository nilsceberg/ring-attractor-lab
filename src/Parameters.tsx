import { observer } from "mobx-react-lite";
import { createWeights, initialState, randomActivity, SimulationState } from "./simulation";
import { ChangeEvent, FocusEvent, PropsWithChildren, useState } from "react";
import { action } from "mobx";
import { Pause, PlayArrow } from "@mui/icons-material";
import { STIMULI } from "./colors";
import { toDegrees, toRadians } from "./util";
import { Matrix } from "./Matrix";

const Input = (props: PropsWithChildren<{ label: string, className?: string}>) => {
    return <div className={`flex flex-col m-1 w-full ${props.className || ""}`}>
        <div className="grow-0 whitespace-nowrap overflow-hidden overflow-ellipsis text-left content-center pr-4 text-xs">{props.label}: </div>
        <div className="basis-0 grow-1 flex flex-row h-[25px] text-sm">
            {props.children}
        </div>
    </div>;
};

const Numeric = (props: { value: number, min: number, max: number, precision?: number, onChange: (value: any) => void }) => {
    const [intermediate, setIntermediate] = useState<string | null>(null);
    const precision = props.precision === undefined ? 2 : props.precision;
    const value = intermediate === null ? props.value.toFixed(precision) : intermediate;

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        setIntermediate(event.target.value);
    };

    const onBlur = (_event: FocusEvent<HTMLInputElement>) => {
        if (intermediate !== null) {
            const value = parseFloat(intermediate);
            if (!Number.isNaN(value)) {
                props.onChange(value);
            }
            setIntermediate(null);
        }
    };

    return <input className="basis-0 w-0 grow-[0.8] pl-1" type="text" value={value} onChange={onChange} onBlur={onBlur} max={props.max.toPrecision(3)} min={props.min.toPrecision(3)} />;
}

const Slider = (props: { value: number, min: number, max: number, step?: number, onChange: (value: any) => void }) => {
    const step = props.step || (props.max - props.min) / 1000;
    return <input className="basis-0 grow-[3]" type="range" value={props.value} onChange={e => props.onChange(parseFloat(e.target.value) || 0)} max={props.max} min={props.min} step={step}/>;
}

const Divider = (props: PropsWithChildren<{}>) => {
    return <div className="w-full ml-auto mr-auto text-center border-b-1 border-[#777] text-[#ccc] mb-2 mt-3">{props.children}</div>
}

const Toggle = (props: { enabled: boolean, onChange?: (enabled: boolean) => void }) => {
    const onChange = props.onChange || (_ => {});

    const position = props.enabled ? "left-[50%] right-0.5" : "left-0.5 right-[50%]";
    const background = props.enabled ? "bg-[#1f7721]" : "bg-[#891c1c]";

    return (
        <div className={`h-full w-20 border-1 border-[#ccc] flex flex-row relative cursor-pointer group ${background} transition-colors text-sm`} onClick={() => onChange(!props.enabled)}>
            <div className="basis-0 grow-1 b-r-1 text-center content-center">ON</div>
            <div className="basis-0 grow-1 b-r-1 text-center content-center">OFF</div>
            <div className={`absolute top-0.5 bottom-0.5 border-1 border-[#ccc] bg-[#555] group-hover:bg-[#777] ${position} transition-[left,right]`}/>
        </div>
    );
}

const Row = (props: PropsWithChildren<{ }>) => {
    return (
        <div className="flex flex-row">{ props.children }</div>
    );
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
    highlight: number | undefined,
    onSetNeuronCount: (count: number) => void,
    setHovering?: (i: number | undefined) => void,
}

export const Parameters = observer((props: Props) => {
    const weightAction = action((updater: (value: number) => void) => (value: number) => {
        updater(value);
        props.state.weights = createWeights(props.state.neurons, props.inputs.a, props.inputs.b);
    });

    const minAngle = -359;
    const maxAngle = 360;

    const MAX_STRENGTH = 5.0;
    const MAX_WIDTH = 180;



    return (
        <>
          <div className="flex-1/2 pl-10">
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

            <Divider><span style={{ color: STIMULI[0] }}>Stimulus A</span></Divider>
            <Row>
                <Input label="Enable" className="basis-0">
                    <Toggle enabled={props.inputs.activeA} onChange={action(enabled => props.inputs.activeA = enabled)}/>
                </Input>
                <Input label="Location (degrees)">
                    <Numeric min={minAngle} max={maxAngle} value={toDegrees(props.inputs.angleA)} onChange={action(value => props.inputs.angleA = toRadians(value))}/>
                    <Slider min={minAngle} max={maxAngle} value={toDegrees(props.inputs.angleA)} onChange={action(value => props.inputs.angleA = toRadians(value))}/>
                </Input>
            </Row>
            <Row>
                <Input label="Width (degrees)">
                    <Numeric min={0} max={MAX_WIDTH} value={toDegrees(props.inputs.widthA)} onChange={action(value => props.inputs.widthA = toRadians(value))}/>
                    <Slider min={0} max={MAX_WIDTH} value={toDegrees(props.inputs.widthA)} onChange={action(value => props.inputs.widthA = toRadians(value))}/>
                </Input>
            </Row>
            <Row>
                <Input label="Strength">
                    <Numeric min={0} max={MAX_STRENGTH} value={props.inputs.strengthA} onChange={action(value => props.inputs.strengthA = value)}/>
                    <Slider min={0} max={MAX_STRENGTH} value={props.inputs.strengthA} onChange={action(value => props.inputs.strengthA = value)}/>
                </Input>
            </Row>

            <Divider><span style={{ color: STIMULI[1] }}>Stimulus B</span></Divider>
            <Row>
                <Input label="Enable" className="basis-0">
                    <Toggle enabled={props.inputs.activeB} onChange={action(enabled => props.inputs.activeB = enabled)}/>
                </Input>
                <Input label="Location (degrees)">
                    <Numeric min={minAngle} max={maxAngle} value={toDegrees(props.inputs.angleB)} onChange={action(value => props.inputs.angleB = toRadians(value))}/>
                    <Slider min={minAngle} max={maxAngle} value={toDegrees(props.inputs.angleB)} onChange={action(value => props.inputs.angleB = toRadians(value))}/>
                </Input>
            </Row>
            <Row>
                <Input label="Width (degrees)">
                    <Numeric min={0} max={MAX_WIDTH} value={toDegrees(props.inputs.widthB)} onChange={action(value => props.inputs.widthB = toRadians(value))}/>
                    <Slider min={0} max={MAX_WIDTH} value={toDegrees(props.inputs.widthB)} onChange={action(value => props.inputs.widthB = toRadians(value))}/>
                </Input>
            </Row>
            <Row>
                <Input label="Strength">
                    <Numeric min={0} max={MAX_STRENGTH} value={props.inputs.strengthB} onChange={action(value => props.inputs.strengthB = value)}/>
                    <Slider min={0} max={MAX_STRENGTH} value={props.inputs.strengthB} onChange={action(value => props.inputs.strengthB = value)}/>
                </Input>
            </Row>


            {/*<Divider>Connectivity</Divider>
            <Input label="a">
                <Numeric min={-1} max={1} value={props.inputs.a} onChange={weightAction(value => props.inputs.a = value)}/>
                <Slider min={-1} max={1} value={props.inputs.a} onChange={weightAction(value => props.inputs.a = value)}/>
            </Input>
            <Input label="b">
                <Numeric min={-1} max={1} value={props.inputs.b} onChange={weightAction(value => {console.log(value); props.inputs.b = value})}/>
                <Slider min={-1} max={1} value={props.inputs.b} onChange={weightAction(value => props.inputs.b = value)}/>
            </Input>*/}

            <Divider>Network</Divider>
            <div className="w-full text-center">{props.state.paused ? <Pause fontSize="large"/> : <PlayArrow fontSize="large"/>} {props.state.time.toFixed(2)} s</div>

            <Row>
                <Input label="Duplicate first row" className="grow">
                    <Toggle enabled={false}/>
                </Input>
                <Input label="Neuron count" className="grow">
                    <Numeric min={4} max={16} value={props.state.neurons} precision={0} onChange={value => { if (value <= 16 && value >= 4 && value % 2 === 0) props.onSetNeuronCount(value); }}/>
                    <Slider min={4} max={16} step={2} value={props.state.neurons} onChange={value => props.onSetNeuronCount(value)}/>
                </Input>
            </Row>
          </div>
          <div className="flex-1/2 overflow-hidden">
            <Matrix state={props.state} highlight={props.highlight} setHovering={props.setHovering}/>
          </div>
        </>
    )
});