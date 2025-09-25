import { Ref, RefObject, useEffect, useState } from "react";

export const toDegrees = (radians: number) => radians / Math.PI * 180;
export const toRadians = (degrees: number) => degrees / 180 * Math.PI;

export function useSize(): [(newRef: HTMLElement | null) => void, [number, number]] {
    const [render, setRender] = useState(0);
    const [ref, setRef] = useState<HTMLElement | null>(null);
    useEffect(() => {
        const listener = (_event: UIEvent) => {
            setRender(render + 1);
        };
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [render]);
    return [setRef, ref ? [ref.clientWidth, ref.clientHeight] : [0, 0]];
}
