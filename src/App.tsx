import { action, observable } from "mobx";
import "./index.css";

import { observer } from "mobx-react-lite";
import { initialState, step } from "./simulation";
import { Ring } from "./Ring";
import { useInterval } from "usehooks-ts";

const STATE = observable({
  simulation: initialState(8),
});

const App = observer(() => {
  const dt = 0.01;
  useInterval(action(() => {
    STATE.simulation = step(STATE.simulation, dt);
  }), dt * 1000);

  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col">
      {/*<div>
        size: <input type="number" value={STATE.simulation.value} onChange={action(e => STATE.simulation.value = Number.parseFloat(e.target.value))}/>
      </div>*/}
      <div className="grow overflow-hidden">
        <Ring state={STATE.simulation}/>
      </div>
    </div>
  );
});

export { App };
