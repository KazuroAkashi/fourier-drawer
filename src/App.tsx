import React, { Ref, useRef } from "react";
import Sketch from "react-p5";
import type P5 from "p5";
import { Fourier } from "./lib/Fourier";
import { Complex } from "./lib/Complex";
import { Svg } from "./lib/Svg";

let init = false;

let lastTime: number;
let now: number;

let ox = 0;
let oy = 0;

let canvas: P5.Renderer;

let fourier: Fourier;
let x: Complex[] = [];

let shape: Complex[] = [];

function render(p5: P5, delta: number) {
    p5.push();
    for (let point of x) {
        p5.color("red");
        p5.ellipse(point.re, point.im, 10);
        p5.color("white");
    }
    p5.stroke(255);
    for (let i = 1; i < shape.length; i++) {
        p5.line(shape[i - 1].re, shape[i - 1].im, shape[i].re, shape[i].im);
    }

    const c = fourier.render(p5, delta);
    shape.push(c);

    if (shape.length > 10000) shape = [];
    p5.pop();
}

export default function App() {
    lastTime = Date.now();

    const setup = (p5: P5, parent: Element) => {
        // To avoid double initialization
        if (init) return;
        init = true;

        ox = p5.displayWidth / 2;
        oy = p5.displayHeight / 2;

        canvas = p5
            .createCanvas(p5.displayWidth, p5.displayHeight)
            .position(-ox + p5.windowWidth / 2, -oy + p5.windowHeight / 2)
            .parent(parent);

        const numdots = 50;
        for (let i = 0; i < numdots; i++) {
            // const re = Math.random() * 300 - 150;
            // const im = Math.random() * 300 - 150;
            /*const re =
                (Math.random() * 300 + 100) * Math.cos((2 * Math.PI * i) / 20);
            const im =
                (Math.random() * 300 + 100) * Math.sin((2 * Math.PI * i) / 20);
            */

            // r(t) = 1 - 2*sint
            const angle = ((2 * Math.PI) / numdots) * i;
            const radius = 1 + 2 * Math.sin(angle) - Math.cos(2 * angle);

            const re = 100 * radius * Math.cos(angle);
            const im = 100 * radius * Math.sin(angle);
            // console.log(angle, radius);

            // const re = (i / numdots) * 400 - 200;
            // const im = -100;

            x.push(new Complex(re, im));
        }

        fourier = new Fourier(x.length, x);
        fourier.dft();
    };

    const draw = (p5: P5) => {
        p5.clear();
        p5.background(0);
        p5.translate(ox, oy);

        now = Date.now();
        render(p5, (now - lastTime) / 1000);
        lastTime = now;

        p5.translate(-ox, -oy);
    };

    const fileInput: Ref<HTMLInputElement> = useRef(null);

    const fileChange = async () => {
        const file = fileInput.current?.files?.[0];
        if (file) {
            const svg = new Svg(await file.text(), 1, 1 / 5);
            x = svg.points;
            fourier = new Fourier(x.length, x);
            fourier.dft();
        }
    };

    return (
        <>
            <Sketch setup={setup} draw={draw}></Sketch>
            <input
                type="file"
                ref={fileInput}
                onChange={fileChange}
                style={{ position: "absolute" }}
            />
        </>
    );
}
