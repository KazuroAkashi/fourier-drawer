import React from "react";
import Sketch from "react-p5/@types";
import type P5 from "p5";

let init = false;

export default function App() {
  const setup = (p5: P5, parent: Element) => {
    // To avoid double initialization
    if (init) return;
    init = true;

    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(parent);
  };

  const draw = (p5: P5) => {
    p5.background(0);
    p5.clear();

    p5.ellipse(400, 400, 50);
  };

  return <Sketch setup={setup} draw={draw}></Sketch>;
}
