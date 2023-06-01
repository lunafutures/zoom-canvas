export const githubUrl = "https://github.com/lunafutures/zoom-canvas";
export class Point {
  constructor(public readonly x: number, public readonly y: number) {}

  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  subtract(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y);
  }

  scale(factor: number): Point {
    return new Point(this.x * factor, this.y * factor);
  }

  toString(): string {
    return `Point(${this.x}, ${this.y})`;
  }
}

/** Used for debugging, prints and returns the object provided. */
export function o<T>(objectToInspect: T, extraMessage: string = ""): T {
  console.log(extraMessage, objectToInspect);
  return objectToInspect;
}
