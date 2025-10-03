import createColormap from "colormap";

export const LINES = "white";
export const EXCITE = "rgb(128, 128, 255)";

export const STIMULI = ["#df79e8", "#68f27f"];
export const HEATMAP_COLOR = 0x6080ff;

export const COLOR_MAP = createColormap({
    colormap: "magma",
    nshades: 32,
    format: "hex",
}).map(s => Number.parseInt(s.substring(1), 16));
export const mapColor = (value: number) => COLOR_MAP[Math.round(value * (COLOR_MAP.length - 1))];