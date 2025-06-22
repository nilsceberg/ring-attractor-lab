import { action, observable } from "mobx";
import "./index.css";

import { observer } from "mobx-react-lite";
import { initialState, step } from "./simulation";
import { useInterval } from "usehooks-ts";
import { Parameters } from "./Parameters";
import { Visualization } from "./Visualization";

const STATE = observable({
  simulation: initialState(8),
  history: [] as [number, number[]][],
});

const App = observer(() => {
  const dt = 0.01;
  useInterval(action(() => {
    STATE.simulation = step(STATE.simulation, dt);
    STATE.history.push([STATE.simulation.time, STATE.simulation.activity]);
    if (STATE.history.length > 1000) {
      STATE.history.shift();
    }
  }), dt * 1000);

  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col">
      <div className="grow overflow-hidden flex flex-row">
        <div className="overflow-hidden grow basis-0">
          <Parameters state={STATE.simulation}/>
        </div>
        <div className="overflow-hidden grow basis-0">
          <Visualization state={STATE.simulation} history={STATE.history}/>
        </div>
      </div>
    </div>
  );
});

export { App };
