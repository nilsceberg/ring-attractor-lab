import { action, autorun, observable, reaction } from "mobx";
import "./index.css";

import { observer } from "mobx-react-lite";
import { createWeights, initialState, step } from "./simulation";
import { useInterval } from "usehooks-ts";
import { InputParameters, Parameters } from "./Parameters";
import { HistoryEntry, Plots } from "./Plots";
import { DT, MAX_HISTORY_SAMPLES } from "./settings";
import { Ring } from "./Ring";
import { Matrix } from "./Matrix";

const STATE = observable({
  simulation: initialState(8),
  history: [] as HistoryEntry[],
  inputs: {
    angle: 0,
    strength: 0,
    a: 0,
    b: 0,
  } as InputParameters,
  highlight: undefined as number | undefined,
});

const App = observer(() => {
  const dt = DT;
  useInterval(action(() => {
    STATE.simulation = step(STATE.simulation, dt, STATE.inputs.angle, STATE.inputs.strength);

    STATE.history.push({
      time: STATE.simulation.time,
      activity: STATE.simulation.activity,
      inputAngle: STATE.inputs.angle,
      inputStrength: STATE.inputs.strength,
    });
    if (STATE.history.length > MAX_HISTORY_SAMPLES) {
      STATE.history.shift();
    }
  }), dt * 1000);

  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col">
      <div className="flex-1/2 overflow-hidden flex flex-row">
        <div className="overflow-hidden flex-1/4">
          <Parameters state={STATE.simulation} inputs={STATE.inputs}/>
        </div>
        <div className="overflow-hidden flex-1/4">
          <Matrix state={STATE.simulation} highlight={STATE.highlight} setHovering={action(i => STATE.highlight = i)}/>
        </div>
        <div className="overflow-hidden flex-1/4"/>
        <div className="overflow-hidden flex-1/4">
          <Ring state={STATE.simulation} highlight={STATE.highlight} setHovering={action(i => STATE.highlight = i)}/>
        </div>
      </div>
      <div className="flex-1/2 overflow-hidden">
        <Plots state={STATE.simulation} history={STATE.history} inputs={STATE.inputs} highlight={STATE.highlight}/>
      </div>
    </div>
  );
});

export { App };
