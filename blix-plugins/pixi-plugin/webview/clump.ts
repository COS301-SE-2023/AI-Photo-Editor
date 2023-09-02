import { Matrix } from "pixi.js";

export type Clump = { class: "clump"; name?: string; transform: Matrix; elements: (Clump | Atom)[] };

// A single indivisible unit of a clump (E.g. image, shape, text etc.)
export type Atom = { class: "atom" } & ({
    type: "image"
    src: string
} | {
    type: "shape"
    shape: "rect" | "circle" | "ellipse" | "line" | "polygon" | "polyline"

    fill: number
    stroke: number
    strokeWidth: number
} | {
    type: "text"
    text: string

    fill: number
    stroke: number
    strokeWidth: number
    fontSize: number
    fontFamily: string
    fontStyle: "normal" | "italic"
    fontWeight: "normal" | "bold"
    textAlign: "left" | "center" | "right"
    textBaseline: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom"
} | {
    type: "paint",
    src: string,
});

export const root1: Clump = {
    class: "clump",
    name: "root",
    transform: new Matrix(),
    elements: [
        {
            class: "atom",
            type: "image",
            src: "https://i.imgur.com/4o4UoJQ.jpg"
        },
        {
            class: "clump",
            name: "clump1",
            transform: new Matrix().translate(100, 100),
            elements: [
                {
                    class: "atom",
                    type: "shape",
                    shape: "rect",

                    fill: 0xFF0000,
                    stroke: 0x00FF00,
                    strokeWidth: 5
                },
                {
                    class: "atom",
                    type: "text",
                    text: "Hello World",

                    fill: 0x0000FF,
                    stroke: 0x00FF00,
                    strokeWidth: 5,
                    fontSize: 20,
                    fontFamily: "Arial",
                    fontStyle: "italic",
                    fontWeight: "bold",
                    textAlign: "center",
                    textBaseline: "middle"
                }
            ]
        }
    ]
}