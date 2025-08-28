import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { DT, MAX_HISTORY_DURATION, MAX_HISTORY_SAMPLES } from "./settings";
import { act, useEffect, useRef, useState } from "react";
import { HistoryEntry } from "./Plots";
import { preferenceAngle, SimulationState } from "./simulation";
import { EXCITE, LINES } from "./colors";
import { PNG } from 'pngjs/browser';
import { Label } from "./Label";

interface ActivityHistoryProps {
    history: HistoryEntry[],
    curves?: [number, number][][],
    curveColors?: string[],
    xExtent: [number, number],
    yExtent: [number, number],
    bars?: [number, number][][],
    barStyles?: any[][],
    state: SimulationState,
}

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

const LegendElement = (props: LegendElementProps) => {
    const className = props.type === LegendType.Heatmap ? "h-4 mb-[-3]" : "h-1 mb-1";

    return <div className="m-3 text-[10pt] cursor-pointer align-middle" style={{ opacity: props.show ? 1.0 : 0.3 }} onClick={_ => (props.onClick || (() => {}))()}>
        <div className={`inline-block w-4 ${className} mr-2`} style={{ backgroundColor: props.color }}/>{props.name}
    </div>;
}

export const ActivityHistory = observer((props: ActivityHistoryProps) => {
    const x = d3.scaleLinear().domain(props.xExtent).range([0, 750]);
    const y = d3.scaleLinear().domain(props.yExtent).range([0, -100]);
    const lines = d3.line(d => x(d[0]), d => y(d[1]));

    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showPVA, setShowPVA] = useState(true);
    const [showStimulusA, setShowStimulusA] = useState(true);
    const [showStimulusB, setShowStimulusB] = useState(true);

    const showCurves = [showPVA, showStimulusA, showStimulusB];
    const curves = (props.curves || []).filter((_, i) => showCurves[i]);
    const curveColors = (props.curveColors || []).filter((_, i) => showCurves[i]);
    const bars = props.bars || [];

    const xAxis = useRef(null);
    const yAxis = useRef(null);
    const rightAxis = useRef(null);
    useEffect(() => {
        if (!xAxis.current || !yAxis.current) return;

        var axis = d3.axisBottom(x).tickFormat(x => (-x).toString());
        d3.select(xAxis.current).call(axis as any);

        const ticks = [];
        for (let i=0; i<props.state.neurons; ++i) {
            ticks.push(preferenceAngle(props.state.neurons, i));
        }

        var axis = d3.axisLeft(y).tickValues(ticks).tickFormat((value, index) => `${index + 1}`);
        d3.select(yAxis.current).call(axis as any);

        var axis = d3.axisRight(y).tickValues(ticks);
        d3.select(rightAxis.current).call(axis as any).attr("transform", "translate(750, 0)");
    }, [xAxis.current, yAxis.current, rightAxis.current]);

    const num_neurons = props.state.neurons;
    let png = new PNG({
        width: MAX_HISTORY_SAMPLES,
        height: num_neurons,
    });
    const HEATMAP_COLOR = 0x6080ff;
    if (showHeatmap) {
        for (let i=0; i<props.history.length; ++i) {
            const activity = props.history[props.history.length - i - 1].activity;
            const k = MAX_HISTORY_SAMPLES - i - 1;
            for (let j=0; j < activity.length; ++j) {
                png.data.writeUInt32BE((HEATMAP_COLOR << 8) + Math.round(activity[j] * 255), 4*(MAX_HISTORY_SAMPLES * ((num_neurons - j - 1 + num_neurons / 2) % num_neurons) + k))
            }
        }
    }
    const img = PNG.sync.write(png).toString("base64");

    const curveElements = [];
    for (const i in curves) {
        const curve = curves[i];
        // Split curves where they jump by more than pi.
        const segments = [];
        let segment: [number, number][] = [];
        for (const point of curve) {
            if (segment.length > 0) {
                const last = segment[segment.length - 1];
                const jump = Math.abs(last[1] - point[1]);
                if (jump > Math.PI) {
                    const mid = 0.5 * (last[0] + point[0]);
                    if (point[1] < last[1]) {
                        segment.push([mid, props.yExtent[1]]);
                    }
                    else {
                        segment.push([mid, props.yExtent[0]]);
                    }

                    segments.push(segment);
                    segment = [];

                    if (point[1] < last[1]) {
                        segment.push([mid, props.yExtent[0]]);
                    }
                    else {
                        segment.push([mid, props.yExtent[1]]);
                    }
                }
            }
            segment.push(point);
        }
        segments.push(segment);

        curveElements.push(<g key={i} stroke={curveColors[i]}>{ segments.map((s, j) => <path key={j} d={lines(s) as string}/>) }</g>)
    }

    return (
        <div className="relative w-full h-full flex flex-col">
            <Label>Activity over time with PVA angle</Label>
            <svg className="absolute w-full h-full" viewBox="-30 -100 800 180">
                <image imageRendering="pixelated" preserveAspectRatio="none" x={x(props.xExtent[0])} y={y(props.yExtent[1])} width={x(props.xExtent[1]) - x(props.xExtent[0])} height={y(props.yExtent[0]) - y(props.yExtent[1])} xlinkHref={`data:image/png;base64,${img}`}/>
                <g ref={xAxis}/>
                <g ref={yAxis}/>
                <g ref={rightAxis}/>
                <g fill="transparent" strokeWidth={2}>
                    { curveElements }
                </g>
                <text textAnchor="middle" transform="translate(-30, -55), rotate(-90)" fill={LINES} fontSize={9}>neuron #</text>
                <text textAnchor="middle" transform="translate(790, -55), rotate(90)" fill={LINES} fontSize={9}>pref. angle</text>
                {/*<text textAnchor="left" x={760} y={0} dy="1.75em" fill={LINES} fontSize={9}>seconds ago</text>*/}
                <text textAnchor="left" x={360} y={20} dy="1em" fill={LINES} fontSize={9}>seconds ago</text>
            </svg>
            <div className="absolute bottom-5 flex flex-row w-full">
                <div className="grow"/>
                <LegendElement type={LegendType.Heatmap} color={"#" + HEATMAP_COLOR.toString(16)} name="activity heatmap" show={showHeatmap} onClick={() => setShowHeatmap(!showHeatmap)}/>
                <LegendElement type={LegendType.Line} color={props.curveColors![0]} name="PVA angle" show={showPVA} onClick={() => setShowPVA(!showPVA)}/>
                <LegendElement type={LegendType.Line} color={props.curveColors![1]} name="stimulus A location" show={showStimulusA} onClick={() => setShowStimulusA(!showStimulusA)}/>
                <LegendElement type={LegendType.Line} color={props.curveColors![2]} name="stimulus B location" show={showStimulusB} onClick={() => setShowStimulusB(!showStimulusB)}/>
                <div className="grow"/>
            </div>
        </div>
    );
});
