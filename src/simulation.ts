import { Matrix, zeros } from "mathjs";

export interface SimulationState {
    neurons: number,
    weights: number[][],//Matrix,
    value: number,
}

export function initialState(neurons: number): SimulationState {
    const weights = zeros([neurons, neurons]) as number[][];
    console.log(weights);

    for (let i=0; i<neurons; ++i) {
        for (let j=0; j<neurons; ++j) {
            if (i == j) {
                continue;
            }

            let a = 2 * Math.PI / neurons * i;
            let b = 2 * Math.PI / neurons * j;
            weights[i][j] = (Math.cos(a - b) + 1.0) / 2.0;
        }
    }

    return {
        neurons,
        weights,
        value: 100,
    }
}
