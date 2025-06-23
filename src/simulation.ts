import { multiply, zeros, add, subtract, dotMultiply, map } from "mathjs";

export interface SimulationState {
    time: number,
    time_constant: number,
    neurons: number,
    weights: number[][],
    value: number,
    activity: number[],
    volatility: number,
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
        time: 0,
        neurons,
        weights,
        value: 100,
        activity,
        time_constant: 0.1,
        volatility: 0.01,
    }
}

export function step(state: SimulationState, dt: number, inputAngle: number, inputStrength: number): SimulationState {
    const newState = Object.assign({}, state);
    newState.time += dt;

    const a = 4;
    const b = 0.4;
    const f = (x: number) => 1 / (1 + Math.exp(-a*(x - b)));

    // input
    const x = [];
    let delta = 2 * Math.PI / state.neurons;
    for (let i=0; i<state.neurons; ++i) {
        x.push(inputStrength * Math.cos(inputAngle - delta * i));
    }

    // du = 1/T [f(Wu + x) - u]dt + sdB
    const T = state.time_constant;
    newState.activity = add(state.activity, dotMultiply(subtract(map(add(multiply(state.weights, state.activity), x), f), state.activity), dt / T));
    newState.activity = add(newState.activity, dotMultiply(randomActivity(state.neurons), state.volatility * Math.sqrt(dt)));
    newState.activity = map(newState.activity, x => Math.max(0, Math.min(1, x)));

    return newState;
}
