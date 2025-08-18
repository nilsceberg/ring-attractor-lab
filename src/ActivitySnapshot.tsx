import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { MAX_HISTORY_DURATION } from "./settings";
import { useEffect, useRef } from "react";
import { LINES } from "./colors";

interface PlotProps {
    curves?: [number, number][][],
    curveColors?: string[],
    xExtent: [number, number],
    yExtent: [number, number],
    bars?: [number, number][][],
    barStyles?: any[][],
}

export const ActivitySnapshot = observer((props: PlotProps) => {
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

    return (
        <svg className="w-full h-full" viewBox="-30 -150 800 180">
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
