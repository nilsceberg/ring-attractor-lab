import { Matrix, zeros } from "mathjs";

export interface SimulationState {
    neurons: number,
    weights: Matrix,
    value: number,
}

export function initialState(neurons: number): SimulationState {
    return {
        neurons,
        weights: zeros(neurons) as Matrix,
        value: 100,
    }
}
