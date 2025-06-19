import { action, observable } from "mobx";
import "./index.css";

import { observer } from "mobx-react-lite";
import { initialState } from "./simulation";
import { Ring } from "./Ring";

const STATE = observable({
  simulation: initialState(8),
});

const App = observer(() => {
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col">
      <div>
        size: <input type="number" value={STATE.simulation.value} onChange={action(e => STATE.simulation.value = Number.parseFloat(e.target.value))}/>
      </div>
      <div className="grow overflow-hidden">
        <Ring state={STATE.simulation}/>
      </div>
    </div>
  );
});

export { App };
