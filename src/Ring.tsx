import * as d3 from "d3";
import { observer } from "mobx-react-lite";
import { SimulationState } from "./simulation";
import { useEffect, useRef, useState } from "react";

const useSvg = (f: (element: d3.Selection<SVGSVGElement, any, any, any>) => void, deps: any[] = []) => {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) {
      let element = d3.select(ref.current);
      f(element);
    }
  }, [ref].concat(deps));
  return ref;
}

export const Ring = observer((props: { state: SimulationState }) => {
  const ref = useSvg(element => {
    //element
    //  .selectAll(".hello")
    //  .data([props.state.value])
    //  .join("circle")
    //  .classed("hello", true)
    //  .attr("fill", "#202020")
    //  .attr("stroke", "white")
    //  .attr("stroke-width", 1)
    //  .transition().duration(1000).attr("r", d => d);
  }, [props.state.value]);

  const [hovering, setHovering] = useState<number | null>(null);

  const data: number[] = [];
  for (let i=0; i<props.state.neurons; ++i) {
    data.push(1);
  }


  const padAngle = 0.20;
  const pie = d3.pie().padAngle(padAngle).startAngle(-Math.PI/props.state.neurons);
  const arcs = pie(data);
  const arc = d3.arc().innerRadius(200).outerRadius(300).padAngle(padAngle);

  const MAX_WEIGHT = 2;
  const MAX_THICKNESS = 0.1;
  const ribbon = (i: number, j: number, w: number) => {
    const inputOutputOffset = 2 * Math.PI / props.state.neurons * 0.15;
    const startLocation = 2 * Math.PI / props.state.neurons * i + inputOutputOffset;
    const endLocation = 2 * Math.PI / props.state.neurons * j - inputOutputOffset;
    const width = Math.abs(w) / MAX_WEIGHT * MAX_THICKNESS;

    return d3.ribbonArrow().headRadius(20).radius(200-5)({
      source: { startAngle: startLocation - width, endAngle: startLocation + width },
      target: { startAngle: endLocation - width, endAngle: endLocation + width },
    } as any);
  };

  const ribbonColor = (i: number, w: number) => {
    let opacity = Math.abs(w) / MAX_WEIGHT * 0.5 + 0.5;
    if (hovering !== null && hovering !== i) {
      opacity = Math.max(0.1, opacity - 0.8);
    }
    if (hovering === i) {
      opacity = 1.0;
    }

    if (w > 0.0) {
      return `rgba(128, 128, 255, ${opacity})`;
    }
    else {
      return `rgba(255, 128, 128, ${opacity})`;
    }
  };

  const cellColor = (i: number) => {
    const opacity = props.state.activity[i];
    return `rgba(255, 255, 255, ${opacity})`;
  };

  return (
    <svg className="w-full h-full" viewBox="-400 -400 800 800" ref={ref}>
      <g>
        {arcs.map((d, i) => <path key={i} fill={cellColor(i)} stroke="white" strokeWidth={2} d={arc(d as any) as string} onMouseEnter={() => setHovering(i)} onMouseLeave={() => setHovering(null)}/>)}
      </g>
      <g>
        {
          props.state.weights.map((row, i) =>
            <g key={i}>
              {row.map((w, j) => [w, j]).filter(([w, j]) => w <= 0).map(([w, j]) =>
                <path key={j} fill={ribbonColor(i, w)} style={{transition: "fill 0.2s"}} d={ribbon(i, j, w) as any}/>
              )}
            </g>
          )
        }
      </g>
      <g>
        {
          props.state.weights.map((row, i) =>
            <g key={i}>
              {row.map((w, j) => [w, j]).filter(([w, j]) => w > 0).map(([w, j]) =>
                <path key={j} fill={ribbonColor(i, w)} style={{transition: "fill 0.2s"}} d={ribbon(i, j, w) as any}/>
              )}
            </g>
          )
        }
      </g>
    </svg>
  );
});
