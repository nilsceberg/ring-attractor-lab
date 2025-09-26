import { action, autorun, observable, reaction } from "mobx";
import "./index.css";

import { observer } from "mobx-react-lite";
import { initialState, step, Stimulus } from "./simulation";
import { useInterval } from "usehooks-ts";
import { InputParameters, Parameters } from "./Parameters";
import { HistoryEntry, Plots } from "./Plots";
import { DT, MAX_HISTORY_SAMPLES } from "./settings";
import { Ring } from "./Ring";
import { useEffect } from "react";
import { StateSpace } from "./StateSpace";

const STATE = observable({
	simulation: initialState(8),
	history: [] as HistoryEntry[],
	inputs: {
		angleA: 0,
		strengthA: 1,
		activeA: false,
		widthA: 2.5,
		angleB: 2.5,
		strengthB: 0.5,
		activeB: false,
		widthB: 0.5,
		a: 0,
		b: 0,
	} as InputParameters,
	highlight: undefined as number | undefined,
});

const App = observer(() => {
	const dt = DT;
	const stimuli: Stimulus[] = [
		{
			location: STATE.inputs.angleA,
			width: STATE.inputs.widthA,
			strength: STATE.inputs.activeA ? STATE.inputs.strengthA : 0,
		},
		{
			location: STATE.inputs.angleB,
			width: STATE.inputs.widthB,
			strength: STATE.inputs.activeB ? STATE.inputs.strengthB : 0,
		},
	];

	useInterval(action(() => {
		if (STATE.simulation.paused) return;

		STATE.simulation = step(STATE.simulation, dt, stimuli);

		STATE.history.push({
			time: STATE.simulation.time,
			activity: STATE.simulation.activity,
			stimuli,
		});
		if (STATE.history.length > MAX_HISTORY_SAMPLES) {
			STATE.history.shift();
		}
	}), dt * 1000);

	useEffect(() => {
		// TODO: do we need to clean this up?
		window.onkeydown = e => {
			if (e.code === "Space") {
				action(() => STATE.simulation.paused = !STATE.simulation.paused)();
				return false;
			}
			return true;
		};
	});

	const onSetNeuronCount = action((count: number) => {
		STATE.history = [];
		STATE.simulation = initialState(count);
	});

	return (
		<div className="absolute left-0 right-0 top-0 bottom-0 flex flex-row noselect m-4">
				<div className="flex-1/3 flex flex-col overflow-hidden">
					<Parameters state={STATE.simulation} inputs={STATE.inputs} onSetNeuronCount={onSetNeuronCount} highlight={STATE.highlight} setHovering={action(i => STATE.highlight = i)}/>
				</div>
				<div className="flex-2/3 flex flex-col">
					<div className="flex-1/2 overflow-hidden flex flex-row">
						<div className="flex-1/2">
							<Ring state={STATE.simulation} stimuli={stimuli} highlight={STATE.highlight} setHovering={action(i => STATE.highlight = i)}/>
						</div>
						<div className="flex-1/2">
							<StateSpace state={STATE.simulation}/>
						</div>
					</div>
					<div className="flex-1/2 overflow-hidden">
						<Plots state={STATE.simulation} history={STATE.history} inputs={STATE.inputs} highlight={STATE.highlight}/>
					</div>
				</div>
		</div>
	);
});

export { App };
