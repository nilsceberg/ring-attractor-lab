import { Matrix, multiply, zeros, add, subtract, dotMultiply, map, SQRT1_2} from "mathjs";

export interface SimulationState {
    time_constant: number,
    neurons: number,
    weights: number[][],
    value: number,
    activity: number[],
}

export function randomActivity(neurons: number): number[] {
    const activity = [];
    for (let i=0; i<neurons; ++i) {
        activity.push(Math.random());
    }
    return activity;
}

export function initialState(neurons: number): SimulationState {
    const weights = zeros([neurons, neurons]) as number[][];

    for (let i=0; i<neurons; ++i) {
        for (let j=0; j<neurons; ++j) {
            if (i == j) {
                continue;
            }

            let a = 2 * Math.PI / neurons * i;
            let b = 2 * Math.PI / neurons * j;
            weights[i][j] = Math.cos(a - b);
        }
    }

    const activity = randomActivity(neurons);

    return {
        neurons,
        weights,
        value: 100,
        activity,
        time_constant: 0.1,
    }
}

export function step(state: SimulationState, dt: number): SimulationState {
    const newState = Object.assign({}, state);

    const a = 4;
    const b = 0.4;
    const f = (x: number) => 1 / (1 + Math.exp(-a*(x - b)));

    // du = 1/T (Wu - u) dt
    const T = state.time_constant;
    newState.activity = add(state.activity, dotMultiply(subtract(map(multiply(state.weights, state.activity), f), state.activity), dt / T));

    return newState;
}
