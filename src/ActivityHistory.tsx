import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { HistoryEntry } from "./Plots";
import { preferenceAngle, SimulationState } from "./simulation";
import { LINES } from "./colors";
import { toDegrees } from "./util";
import { Divider } from "./ui";
import { LegendState } from "./Legend";
import { Heatmap } from "./Heatmap";

interface ActivityHistoryProps {
    history: HistoryEntry[],
    curves?: [number, number][][],
    curveColors?: string[],
    xExtent: [number, number],
    yExtent: [number, number],
    bars?: [number, number][][],
    barStyles?: any[][],
    state: SimulationState,
    legend: LegendState,
}

export const ActivityHistory = observer((props: ActivityHistoryProps) => {
    const x = d3.scaleLinear().domain(props.xExtent).range([0, 750]);
    const y = d3.scaleLinear().domain(props.yExtent).range([0, -100]);
    const lines = d3.line(d => x(d[0]), d => y(d[1]));

    const legend = props.legend;
    const showCurves = [legend.pva, legend.stimulusA, legend.stimulusB];
    const curves = (props.curves || []).filter((_, i) => showCurves[i]);
    const curveColors = (props.curveColors || []).filter((_, i) => showCurves[i]);

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
            <svg className="grow-1 w-full" viewBox="-50 -110 850 145">
                <Heatmap show={legend.heatmap} state={props.state} history={props.history} xExtent={[x(props.xExtent[0]), x(props.xExtent[1])]} yExtent={[y(props.yExtent[0]), y(props.yExtent[1])]}/>
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
        </div>
    );
});
