import { HEATMAP_COLOR } from "./colors";

enum LegendType {
    Line, Heatmap
}

interface LegendElementProps {
    type: LegendType,
    color: string,
    name: string,
    show: boolean,
    onClick?: () => void,
}

export interface LegendState {
    heatmap: boolean,
    pva: boolean,
    stimulusA: boolean,
    stimulusB: boolean,
}

interface LegendProps {
    state: LegendState,
    updateState: (state: LegendState) => void,
    colors: string[],
}

const LegendElement = (props: LegendElementProps) => {
    const className = props.type === LegendType.Heatmap ? "h-4 mb-[-3]" : "h-1 mb-1";

    return <div className="m-3 text-[10pt] cursor-pointer align-middle" style={{ opacity: props.show ? 1.0 : 0.3 }} onClick={_ => (props.onClick || (() => {}))()}>
        <div className={`inline-block w-4 ${className} mr-2`} style={{ backgroundColor: props.color }}/>{props.name}
    </div>;
}

export const Legend = (props: LegendProps) => {
    const flipState = (key: keyof LegendState) => {
        props.updateState(Object.assign({}, props.state, { [key]: !props.state[key] }));
    };
    
    return <div className="flex flex-row w-full">
        <div className="grow"/>
        <LegendElement type={LegendType.Heatmap} color={"#" + HEATMAP_COLOR.toString(16)} name="activity heatmap" show={props.state.heatmap} onClick={() => flipState("heatmap")}/>
        <LegendElement type={LegendType.Line} color={props.colors[0]} name="PVA angle" show={props.state.pva} onClick={() => flipState("pva")}/>
        <LegendElement type={LegendType.Line} color={props.colors[1]} name="stimulus A location" show={props.state.stimulusA} onClick={() => flipState("stimulusA")}/>
        <LegendElement type={LegendType.Line} color={props.colors[2]} name="stimulus B location" show={props.state.stimulusB} onClick={() => flipState("stimulusB")}/>
        <div className="grow"/>
    </div>;
}