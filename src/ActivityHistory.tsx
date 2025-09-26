import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { DT, MAX_HISTORY_DURATION, MAX_HISTORY_SAMPLES } from "./settings";
import { act, useEffect, useRef, useState } from "react";
import { HistoryEntry } from "./Plots";
import { preferenceAngle, SimulationState } from "./simulation";
import { EXCITE, HEATMAP_COLOR, LINES } from "./colors";
import { PNG } from 'pngjs/browser';
import { Label } from "./Label";
import { toDegrees } from "./util";
import { Divider } from "./ui";
import { Legend, LegendState } from "./Legend";
import { PanoramaVertical } from "@mui/icons-material";

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

export const ActivityHistory = observer((props: ActivityHistoryProps) => {
    const x = d3.scaleLinear().domain(props.xExtent).range([0, 750]);
    const y = d3.scaleLinear().domain(props.yExtent).range([0, -100]);
    const lines = d3.line(d => x(d[0]), d => y(d[1]));

    const [legendState, setLegendState] = useState<LegendState>({
        heatmap: true,
        pva: true,
        stimulusA: true,
        stimulusB: true,
    });

    const showCurves = [legendState.pva, legendState.stimulusA, legendState.stimulusB];
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

        var axis = d3.axisRight(y).tickValues(ticks).tickFormat((value, index) => `${toDegrees(value as number).toFixed(0)}`);
        d3.select(rightAxis.current).call(axis as any).attr("transform", "translate(750, 0)");
    }, [xAxis.current, yAxis.current, rightAxis.current]);

    const num_neurons = props.state.neurons;
    let png = new PNG({
        width: MAX_HISTORY_SAMPLES,
        height: num_neurons,
    });
    if (legendState.heatmap) {
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
            <Divider>History</Divider>
            <svg className="grow-1 w-full border-1" viewBox="-50 -100 850 180">
                <image imageRendering="pixelated" preserveAspectRatio="none" x={x(props.xExtent[0])} y={y(props.yExtent[1])} width={x(props.xExtent[1]) - x(props.xExtent[0])} height={y(props.yExtent[0]) - y(props.yExtent[1])} xlinkHref={`data:image/png;base64,${img}`}/>
                <g ref={xAxis}/>
                <g ref={yAxis}/>
                <g ref={rightAxis}/>
                <g fill="transparent" strokeWidth={2}>
                    { curveElements }
                </g>
                <text textAnchor="middle" transform="translate(-30, -55), rotate(-90)" fill={LINES} fontSize={9}>neuron #</text>
                <text textAnchor="middle" transform="translate(790, -55), rotate(90)" fill={LINES} fontSize={9}>angle (degrees)</text>
                {/*<text textAnchor="left" x={760} y={0} dy="1.75em" fill={LINES} fontSize={9}>seconds ago</text>*/}
                <text textAnchor="left" x={360} y={20} dy="1em" fill={LINES} fontSize={9}>seconds ago</text>
            </svg>
            <Legend colors={props.curveColors!} state={legendState} updateState={setLegendState}/>
        </div>
    );
});
