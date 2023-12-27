export class Complex {
    constructor(public readonly re: number, public readonly im: number) {}

    public readonly r = Math.sqrt(this.re * this.re + this.im * this.im);
    public readonly angle = Math.atan2(this.im, this.re);
    public freq = 0;

    add(other: Complex): Complex {
        return new Complex(this.re + other.re, this.im + other.im);
    }

    mul(other: Complex): Complex {
        const re = this.re * other.re - this.im * other.im;
        const im = this.re * other.im + this.im * other.re;
        return new Complex(re, im);
    }

    scaled(num: number): Complex {
        return new Complex(this.re * num, this.im * num);
    }
}
