declare module "jsclipper" {
  type Coordinate = [number, number];
  type Path = Coordinate[];
  type Paths = Path[];

  interface JsClipper {
    union(subject: Paths, clips: Paths[]): Paths | false;
  }

  const jsclipper: JsClipper;
  export default jsclipper;
}
