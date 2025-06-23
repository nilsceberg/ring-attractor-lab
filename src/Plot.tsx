import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { MAX_HISTORY_DURATION } from "./settings";
import { useEffect, useRef } from "react";

interface PlotProps {
    curves: [number, number][][],
    colors?: string[],
    xExtent: [number, number],
    yExtent: [number, number],
}

export const Plot = observer((props: PlotProps) => {
    const [min, max] = props.xExtent;
    const x = d3.scaleLinear().domain([min, min + MAX_HISTORY_DURATION]).range([0, 700]); //[props.history[0][0], props.history[props.history.length - 1][0]]);
    const y = d3.scaleLinear().domain(props.yExtent).range([0, -150]);
    const lines = d3.line(d => x(d[0]), d => y(d[1]));

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
            {
                props.curves.map((data, i) =>
                    <path key={i} fill="transparent" stroke={props.colors ? props.colors[i] : "white"} strokeWidth="2" d={lines(data) as string}/>
                )
            }
        </svg>
    );
});
