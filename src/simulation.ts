import { multiply, zeros, add, subtract, dotMultiply, map } from "mathjs";
import { computed } from "mobx";

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

export function whiteNoiseDifferential(neurons: number): number[] {
    const vector = [];
    for (let i=0; i<neurons; ++i) {
        vector.push(Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()));
    }
    return vector;
}

export function weightFunction(theta: number, phi: number, a: number, b: number): number {
    return a + (1-a)*b*Math.cos(theta - phi);
}

export function preferenceAngle(neurons: number, i: number): number {
    return wrapAngle(2 * Math.PI / neurons * i);
}

export function wrapAngle(theta: number): number {
    const x = Math.sign(theta) * (Math.abs(theta) % (2 * Math.PI));
    return (x + 3*Math.PI) % (2 * Math.PI) - Math.PI;
}

export function createWeights(neurons: number, a: number, b: number): number[][] {
    const weights = zeros([neurons, neurons]) as number[][];
    for (let i=0; i<neurons; ++i) {
        for (let j=0; j<neurons; ++j) {
            if (i == j) {
                continue;
            }

            let theta = preferenceAngle(neurons, i); //2 * Math.PI / neurons * i;
            let phi = preferenceAngle(neurons, j); //2 * Math.PI / neurons * j;
            weights[i][j] = weightFunction(theta, phi, a, b);
            //weights[i][j] -= c + (1-c)*d*Math.cos(theta - phi);
        }
    }
    return weights;
}

export function initialState(neurons: number): SimulationState {
    const weights = createWeights(neurons, 0, 0);
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
    newState.activity = add(newState.activity, dotMultiply(whiteNoiseDifferential(state.neurons), state.volatility * Math.sqrt(dt)));
    newState.activity = map(newState.activity, x => Math.max(0, Math.min(1, x)));

    return newState;
}
