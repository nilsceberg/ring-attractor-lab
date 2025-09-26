import { observer } from "mobx-react-lite";
import * as d3 from "d3";
import { MAX_HISTORY_DURATION } from "./settings";
import { useEffect, useRef } from "react";
import { LINES } from "./colors";
import { Label } from "./Label";
import { Divider } from "./ui";

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
    const y = d3.scaleLinear().domain(props.yExtent).range([0, -100]);

    const bars = props.bars || [];

    const xAxis = useRef(null);
    const yAxis = useRef(null);
    useEffect(() => {
        if (!xAxis.current || !yAxis.current) return;

        var axis = d3.axisBottom(x).tickValues(bars[0].map((_, i) => i)).tickFormat(i => `${i as number + 1}`);
        d3.select(xAxis.current).call(axis as any);

        var axis = d3.axisLeft(y);
        d3.select(yAxis.current).call(axis as any);
    }, [bars, xAxis.current, yAxis.current]);

    return (
        <div className="relative w-full h-full flex flex-col">
            <Divider>Current Activity</Divider>
            <svg className="grow-1" viewBox="-50 -110 850 145">
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
                <text textAnchor="middle" transform="translate(-30, -55), rotate(-90)" fill={LINES} fontSize={9}>activity</text>
                {/*<text textAnchor="left" x={760} y={0} dy="1.75em" fill={LINES} fontSize={9}>neuron #</text>*/}
                <text textAnchor="left" x={360} y={20} dy="1em" fill={LINES} fontSize={9}>neuron #</text>
            </svg>
        </div>
    );
});
