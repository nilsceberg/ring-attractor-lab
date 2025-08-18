import * as d3 from "d3";
import { observer } from "mobx-react-lite";
import { populationVectorAverage, SimulationState, wrapAngle } from "./simulation";
import { LINES } from "./colors";

const GRID_COLOR=LINES;
const RADII = 16;

export const StateSpace = observer((props: { state: SimulationState }) => {
  const radius = d3.scaleLinear([-0, 1], [0, 320]);

  const radii = [];
  for (let i=0; i<RADII; ++i) {
    const r = radius.range()[1];
    const theta = 2 * Math.PI / RADII * i;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const degrees = Math.round(wrapAngle(theta) / (2*Math.PI) * 360 * 10) / 10;
    radii.push(<g>
      <line x1={0} y1={0} x2={x} y2={y} stroke={GRID_COLOR}/>
      <text x={x*1.1} y={y*1.1} stroke={GRID_COLOR} dy="0.5em" textAnchor="middle">{degrees} &deg;</text>
    </g>);
  }

  const pva = populationVectorAverage(props.state.activity);

  return (
    <svg className="w-full h-full" viewBox="-400 -400 800 800">
      <g>
        <circle cx={0} cy={0} r={radius(1)} fill="none" stroke={GRID_COLOR}/>
        <circle cx={0} cy={0} r={radius(0.5)} fill="none" stroke={GRID_COLOR}/>
        <g>{ radii }</g>
      </g>
      <circle cx={radius(pva[0])} cy={radius(pva[1])} r={10} fill="white"/>
    </svg>
  );
});
