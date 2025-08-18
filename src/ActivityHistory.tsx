import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { DT, MAX_HISTORY_DURATION, MAX_HISTORY_SAMPLES } from "./settings";
import { act, useEffect, useRef } from "react";
import { HistoryEntry } from "./Plots";
import { preferenceAngle } from "./simulation";
import { EXCITE, LINES } from "./colors";
import { PNG } from 'pngjs/browser';

interface ActivityHistoryProps {
    history: HistoryEntry[],
    curves?: [number, number][][],
    curveColors?: string[],
    xExtent: [number, number],
    yExtent: [number, number],
    bars?: [number, number][][],
    barStyles?: any[][],
}

export const ActivityHistory = observer((props: ActivityHistoryProps) => {
    const x = d3.scaleLinear().domain(props.xExtent).range([0, 750]); //[props.history[0][0], props.history[props.history.length - 1][0]]);
    const y = d3.scaleLinear().domain(props.yExtent).range([0, -130]);
    const lines = d3.line(d => x(d[0]), d => y(d[1]));

    const curves = props.curves || [];
    const bars = props.bars || [];

    const xAxis = useRef(null);
    const yAxis = useRef(null);
    useEffect(() => {
        if (!xAxis.current || !yAxis.current) return;

        var axis = d3.axisBottom(x);
        d3.select(xAxis.current).call(axis as any);

        var axis = d3.axisLeft(y);
        d3.select(yAxis.current).call(axis as any);
    }, [xAxis.current, yAxis.current]);

    const num_neurons = 8; //props.history[0].activity.length;
    let png = new PNG({
        width: MAX_HISTORY_SAMPLES,
        height: num_neurons,
    });
    for (let i=0; i<props.history.length; ++i) {
        const activity = props.history[i].activity;
        for (let j=0; j < activity.length; ++j) {
            png.data.writeUInt32BE(0x90a0ff00 + Math.round(activity[j] * 255), 4*(MAX_HISTORY_SAMPLES * ((num_neurons - j - 1 + 4) % num_neurons) + i))
        }
    }
    const img = PNG.sync.write(png).toString("base64");

    return (
        <div className="relative w-full h-full">
            {/*<canvas className="absolute w-full h-full" ref={canvas}/>*/}
            <svg className="absolute w-full h-full" viewBox="-30 -150 800 180">
                <image imageRendering="pixelated" preserveAspectRatio="none" x={x(props.xExtent[0])} y={y(props.yExtent[1])} width={x(props.xExtent[1]) - x(props.xExtent[0])} height={y(props.yExtent[0]) - y(props.yExtent[1])} xlinkHref={`data:image/png;base64,${img}`}/>
                <g ref={xAxis}/>
                <g ref={yAxis}/>
                <g>
                    {
                        bars.map((bars, i) =>
                            <g key={i}>
                                {
                                    bars.map(([band, height], j) => {
                                        const rw = 20;
                                        const rx = x(band) - rw/2;
                                        const ry = y(height);
                                        const rh = Math.abs(ry);
                                        const style = props.barStyles ? props.barStyles[i][j] : { stroke: LINES, fill: "gray", strokeWidth: 1 };
                                        style.strokeWidth = 1;
                                        return <rect key={j} x={rx} y={ry} width={rw} height={rh} {...style}/>;
                                    })
                                }
                            </g>
                        )
                    }
                </g>
                {/*<g>
                    {
                        props.history.map((entry, j) => <g key={j}>{entry.activity.map(
                            (a, i) => {
                                const field = 2 * Math.PI / entry.activity.length;
                                const angle = preferenceAngle(entry.activity.length, i) + field / 2;
                                return <rect key={i} x={x(entry.time) + 1} width={x(DT) - x(0)} y={y(angle)} height={y(0) - y(field)} strokeWidth={0} opacity={a} fill={EXCITE}/>;
                            })}</g>
                        )
                    }
                </g>*/}
                <g>
                    {
                        curves.map((data, i) =>
                            <path key={i} fill="transparent" stroke={props.curveColors ? props.curveColors[i] : "white"} strokeWidth="2" d={lines(data) as string}/>
                        )
                    }
                </g>
            </svg>
        </div>
    );
});
