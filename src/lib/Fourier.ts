import type P5 from "p5";
import { Complex } from "./Complex";

export class Fourier {
    constructor(public readonly N: number, public readonly x: Complex[]) {}

    private X: Complex[] = [];
    private t = 0;

    dft() {
        for (let k = 0; k < this.N; k++) {
            this.X[k] = new Complex(0, 0);
            for (let n = 0; n < this.N; n++) {
                const cosine = Math.cos((2 * Math.PI * k * n) / this.N);
                const sine = Math.sin((2 * Math.PI * k * n) / this.N);
                this.X[k] = this.X[k].add(
                    this.x[n].mul(new Complex(cosine, -sine))
                );
            }
            this.X[k] = this.X[k].scaled(1 / this.N);
            this.X[k].freq = k;
        }

        //this.X.sort((a, b) => b.r - a.r);
        this.X.sort((a, b) => a.freq - b.freq);
    }

    render(p5: P5, delta: number) {
        p5.push();

        p5.noFill();
        p5.stroke(255, 150);

        let xnow = 0;
        let ynow = 0;

        for (let k = 0; k < this.N; k++) {
            const coeff = this.X[k];
            const xoff = coeff.r * Math.cos(coeff.freq * this.t + coeff.angle);
            const yoff = coeff.r * Math.sin(coeff.freq * this.t + coeff.angle);

            p5.ellipse(xnow, ynow, 2 * coeff.r);
            p5.line(xnow, ynow, xnow + xoff, ynow + yoff);
            xnow += xoff;
            ynow += yoff;
        }

        this.t += delta;

        p5.pop();
        return new Complex(xnow, ynow);
    }
}
