import { PNG } from "pngjs/browser";
import { HEATMAP_COLOR } from "./colors";
import { SimulationState } from "./simulation";
import { MAX_HISTORY_SAMPLES } from "./settings";
import { HistoryEntry } from "./Plots";

interface HeatmapData {
    completedChunks: string[],
}

function createDebugChunk(height: number, width: number): string {
    let png = new PNG({
        width,
        height,
    });

    for (let i=0; i<width; ++i) {
        const color = 0xFF0000;
        for (let j=0; j < height; ++j) {
            png.data.writeUInt32BE((color << 8) + Math.round(i / width), 4*(width * ((height - j - 1 + height / 2) % height) + i));
        }
    }
    
    return PNG.sync.write(png).toString("base64");
}

function initializeHeatmap(chunkCount: number, totalWidth: number, height: number): HeatmapData {
    const chunks = [];
    const chunkWidth = Math.ceil(totalWidth / chunkCount);
    for (let i=0; i<=chunkCount; ++i) {
        chunks.push(createDebugChunk(height, 64));
    }
    return {
        completedChunks: chunks,
    }
}


    //if (legend.heatmap) {
    //    for (let i=0; i<props.history.length; ++i) {
    //        const activity = props.history[props.history.length - i - 1].activity;
    //        const k = MAX_HISTORY_SAMPLES - i - 1;
    //        for (let j=0; j < activity.length; ++j) {
    //            png.data.writeUInt32BE((HEATMAP_COLOR << 8) + Math.round(activity[j] * 255), 4*(MAX_HISTORY_SAMPLES * ((num_neurons - j - 1 + num_neurons / 2) % num_neurons) + k))
    //        }
    //    }
    //}
    //const img = PNG.sync.write(png).toString("base64");


interface HeatmapProps {
    state: SimulationState,
    history: HistoryEntry[],
    show: boolean,
    xExtent: [number, number],
    yExtent: [number, number],
}

export const Heatmap = (props: HeatmapProps) => {
    const num_neurons = props.state.neurons;
    let png = new PNG({
        width: MAX_HISTORY_SAMPLES,
        height: num_neurons,
    });
    if (props.show) {
        for (let i=0; i<props.history.length; ++i) {
            const activity = props.history[props.history.length - i - 1].activity;
            const k = MAX_HISTORY_SAMPLES - i - 1;
            for (let j=0; j < activity.length; ++j) {
                png.data.writeUInt32BE((HEATMAP_COLOR << 8) + Math.round(activity[j] * 255), 4*(MAX_HISTORY_SAMPLES * ((num_neurons - j - 1 + num_neurons / 2) % num_neurons) + k))
            }
        }
    }
    const img = PNG.sync.write(png).toString("base64");

    return <image imageRendering="pixelated" preserveAspectRatio="none" x={props.xExtent[0]} y={props.yExtent[1]} width={props.xExtent[1] - props.xExtent[0]} height={props.yExtent[0] - props.yExtent[1]} xlinkHref={`data:image/png;base64,${img}`}/>;
}