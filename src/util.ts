import { DOMElement, ReactElement, Ref, RefObject, useEffect, useState } from "react";

export const toDegrees = (radians: number) => radians / Math.PI * 180;
export const toRadians = (degrees: number) => degrees / 180 * Math.PI;

export function useSize(): [[number, number], (newRef: SVGSVGElement | HTMLElement | null) => void] {
    const [render, setRender] = useState(0);
    const [ref, setRef] = useState<SVGSVGElement | HTMLElement | null>(null);
    useEffect(() => {
        const listener = (_event: UIEvent) => {
            setRender(render + 1);
        };
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [render]);
    return [ref ? [ref.clientWidth, ref.clientHeight] : [0, 0], setRef];
}
