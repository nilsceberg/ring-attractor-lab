import * as d3 from "d3";
import { observer } from "mobx-react-lite";
import { initialState, SimulationState } from "./simulation";
import { useEffect, useRef } from "react";

export const Ring = observer((props: { state: SimulationState }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref) return;

    const data = [props.state.value];

    const svgElement = d3.select(ref.current)
    if (!(ref.current as any).initialized) {
        console.log("what");
        (ref.current as any).initialized = true;

        svgElement
        .selectAll(".hello")
        .data([props.state.value])
        .join("circle")
        .classed("hello", true)
        .attr("fill", "#202020")
        .attr("stroke", "#888")
        .attr("stroke-width", "1px")
        .transition().duration(1000).attr("r", d => d)

        //const chord = d3.chord()
        //  .padAngle(10 / 100)
        //  .sortSubgroups(d3.descending)
        //  .sortChords(d3.descending);

        ////const arc = d3.arc()
        ////  .innerRadius(props.state.value)
        ////  .outerRadius(props.state.value + 20)
        ////  .startAngle(0)
        ////  .endAngle(1)
        ////  ({});
        //const arc = d3.arc()({
        //    innerRadius: props.state.value,
        //    outerRadius: props.state.value + 20,
        //    startAngle: 0,
        //    endAngle: 1,
        //});
        //    .selectAll()
        //    .append("path")
        //    .attr("class", "arc")
        //    .attr("fill", "#888")
        //    .attr("d", arc);
    } else {
        console.log("updated");
        //svgElement
        //    .selectAll(".hello")
        //    .data([props.state.value])
        //    .join("circle")
        //.classed("hello", true)
        //.attr("fill", "#202020")
        //.attr("stroke", "#888")
        //.attr("stroke-width", "1px")
        svgElement
        .selectAll(".hello")
        .data([props.state.value])
        .attr("r", d => d)
    }

    return () => {
    };
  }, [ref, props.state.value]);

  return (
    <svg className="w-full h-full border-1" viewBox="-200 -200 400 400" ref={ref}/>
  );
});
