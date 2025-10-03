import { useMemo } from "react";
import { HEATMAP_COLOR, mapColor } from "./colors";
import { PNG } from "pngjs/browser";

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
    const icon = props.type === LegendType.Heatmap 
        ? <ColorBar className="inline-block float-left"/>
        : <div className="inline-block w-4 h-1 mt-2 mr-3 float-left" style={{ backgroundColor: props.color }}/>;

    return <div className="m-3 mr-5 text-[10pt] cursor-pointer align-middle" style={{ opacity: props.show ? 1.0 : 0.3 }} onClick={_ => (props.onClick || (() => {}))()}>
        {icon} {props.name}
    </div>;
}

function createColorBar() {
    const png = new PNG({
        height: 1,
        width: 32,
    });

    for (let i=0; i<png.width; ++i) {
        png.data.writeInt32BE((mapColor(i / (png.width - 1)) << 8) + 0xff, i*4);
    }

    return PNG.sync.write(png).toString("base64");
}

const ColorBar = (props: { className: string }) => {
    const base64 = useMemo(createColorBar, []);
    return (
        <svg className={`h-10 w-30 ${props.className}`} viewBox="0 0 84 32">
            <image x={5} width={74} height={12} xlinkHref={`data:image/png;base64,${base64}`} preserveAspectRatio="none"/>
            <rect x={5} width={74} height={12} stroke="white" strokeWidth={1} fill="none"/>
            <path d="M 5 12 L 5 16" stroke="white" strokeWidth={1}/>
            <path d="M 79 12 L 79 16" stroke="white" strokeWidth={1}/>
            <text x={5} y={25} fill="white" textAnchor="middle" fontSize={8}>0.0</text>
            <text x={79} y={25} fill="white" textAnchor="middle" fontSize={8}>1.0</text>
        </svg>
    );
}

export const Legend = (props: LegendProps) => {
    const flipState = (key: keyof LegendState) => {
        props.updateState(Object.assign({}, props.state, { [key]: !props.state[key] }));
    };
    
    return (
        <div className="flex flex-row w-full">
            <div className="grow"/>
                <LegendElement type={LegendType.Heatmap} color={"#" + HEATMAP_COLOR.toString(16)} name="activity heatmap" show={props.state.heatmap} onClick={() => flipState("heatmap")}/>
                <LegendElement type={LegendType.Line} color={props.colors[0]} name="PVA angle" show={props.state.pva} onClick={() => flipState("pva")}/>
                <LegendElement type={LegendType.Line} color={props.colors[1]} name="stimulus A location" show={props.state.stimulusA} onClick={() => flipState("stimulusA")}/>
                <LegendElement type={LegendType.Line} color={props.colors[2]} name="stimulus B location" show={props.state.stimulusB} onClick={() => flipState("stimulusB")}/>
            <div className="grow"/>
        </div>
    );
}