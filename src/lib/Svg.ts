import { Complex } from "./Complex";

export class Svg {
    points: Complex[] = [];

    constructor(content: string, pointDensity: number, scale: number) {
        // Parsing html hack
        const old_el = document.getElementById("svg_image");
        if (old_el) {
            document.removeChild(old_el);
        }

        const html = document.createElement("html");
        html.id = "svg_image";
        html.innerHTML = content;

        const paths = html.querySelectorAll("path,rect,g");
        this.calculatePointArray(paths, pointDensity, scale);
    }

    private calculatePointArray(
        paths: NodeListOf<Element>,
        pointDensity: number,
        scale: number
    ) {
        let curX = 0,
            curY = 0;
        const pd = 1 / pointDensity;

        for (const el of paths.values()) {
            console.log(this.points);
            if (el.tagName === "g") {
                curX = 0;
                curY = 0;
            } else if (el.tagName === "rec") {
                const x = parseFloat(el.getAttribute("x") || "0");
                const y = parseFloat(el.getAttribute("y") || "0");
                const width = parseFloat(el.getAttribute("width") || "0");
                const height = parseFloat(el.getAttribute("height") || "0");

                curX = x;
                curY = y;

                while (curX < x + width) {
                    this.points.push(new Complex(curX * scale, curY * scale));
                    curX += pd;
                }
                while (curY < y + height) {
                    this.points.push(new Complex(curX * scale, curY * scale));
                    curY += pd;
                }
                while (curX > x) {
                    this.points.push(new Complex(curX * scale, curY * scale));
                    curX -= pd;
                }
                while (curY > y) {
                    this.points.push(new Complex(curX * scale, curY * scale));
                    curY -= pd;
                }
            } else if (el.tagName === "path") {
                const d = el.getAttribute("d") || "";

                let sx = 0,
                    sy = 0;
                let start = true;
                let i = 0;
                while (i < d.length) {
                    if (d.at(i) === "m") {
                        const [dx, dy] = this.fetchParameters2(d, i);

                        curX += dx;
                        curY += dy;
                    } else if (d.at(i) === "M") {
                        const [x, y] = this.fetchParameters2(d, i);

                        curX = x;
                        curY = y;
                    } else if (d.at(i) === "h" || d.at(i) === "H") {
                        let x2;

                        if (d.at(i) === "h") {
                            const w = this.fetchParameter1(d, i);
                            x2 = curX + w;
                        } else {
                            x2 = this.fetchParameter1(d, i);
                        }
                        const forward = curX < x2;

                        while (
                            (forward && curX < x2) ||
                            (!forward && curX > x2)
                        ) {
                            this.points.push(
                                new Complex(curX * scale, curY * scale)
                            );
                            if (forward) curX += pd;
                            else curX -= pd;
                        }
                    } else if (d.at(i) === "v" || d.at(i) === "V") {
                        let y2;

                        if (d.at(i) === "h") {
                            const h = this.fetchParameter1(d, i);
                            y2 = curY + h;
                        } else {
                            y2 = this.fetchParameter1(d, i);
                        }
                        const forward = curY < y2;

                        while (
                            (forward && curY < y2) ||
                            (!forward && curY > y2)
                        ) {
                            this.points.push(
                                new Complex(curX * scale, curY * scale)
                            );
                            if (forward) curY += pd;
                            else curY -= pd;
                        }
                    } else if (
                        d.at(i) === "l" ||
                        d.at(i) === "L" ||
                        d.at(i) === "z" ||
                        d.at(i) === "Z"
                    ) {
                        let x2 = curX,
                            y2 = curY;

                        if (d.at(i) === "l") {
                            const [dx, dy] = this.fetchParameters2(d, i);

                            x2 = curX + dx;
                            y2 = curY + dy;
                        } else if (d.at(i) === "L") {
                            const [x, y] = this.fetchParameters2(d, i);

                            x2 = x;
                            y2 = y;
                        } else if (d.at(i) === "z" || d.at(i) === "Z") {
                            x2 = sx;
                            y2 = sy;
                        }

                        if (x2 - curX === 0) {
                            const forward = curY < y2;

                            while (
                                (forward && curY < y2) ||
                                (!forward && curY > y2)
                            ) {
                                this.points.push(
                                    new Complex(curX * scale, curY * scale)
                                );
                                if (forward) curY += pd;
                                else curY -= pd;
                            }
                        } else {
                            const forward = curX < x2;
                            const slope = (y2 - curY) / (x2 - curX);
                            const pdnew = pd / Math.sqrt(1 + slope * slope);

                            while (
                                (forward && curX < x2) ||
                                (!forward && curX > x2)
                            ) {
                                this.points.push(
                                    new Complex(curX * scale, curY * scale)
                                );
                                if (forward) curX += pdnew;
                                else curX -= pdnew;
                                curY += pdnew * slope;
                            }
                        }
                    }

                    i += 2;

                    if (start) {
                        sx = curX;
                        sy = curY;
                        start = false;
                    }
                }
            }
        }
    }

    private fetchParameters2(d: string, i: number) {
        let p1 = 0;
        let p2 = 0;
        let buffer: string = "";

        i += 2;

        while (d.at(i) != " " && d.at(i) != ",") {
            buffer += d.at(i);
            i++;
        }
        p1 = parseFloat(buffer);
        buffer = "";

        i += 1;
        while (d.at(i) != " ") {
            buffer += d.at(i);
            i++;
            if (i === d.length) break;
        }
        p2 = parseFloat(buffer);

        return [p1, p2];
    }

    private fetchParameter1(d: string, i: number) {
        console.log(d, i);
        let p = 0;
        let buffer: string = "";

        i += 2;

        while (d.at(i) != " ") {
            buffer += d.at(i);
            i++;
            if (i === d.length) break;
        }
        p = parseFloat(buffer);

        return p;
    }
}
