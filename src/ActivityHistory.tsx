import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { DT, MAX_HISTORY_DURATION } from "./settings";
import { useEffect, useRef } from "react";
import { HistoryEntry } from "./Plots";
import { preferenceAngle } from "./simulation";
import { EXCITE } from "./colors";

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
    const x = d3.scaleLinear().domain(props.xExtent).range([0, 700]); //[props.history[0][0], props.history[props.history.length - 1][0]]);
    const y = d3.scaleLinear().domain(props.yExtent).range([0, -150]);
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

    return (
        <svg className="w-full h-full" viewBox="-50 -150 800 180">
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
                                    const style = props.barStyles ? props.barStyles[i][j] : { stroke: "white", fill: "gray", strokeWidth: 1 };
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
    );
});
