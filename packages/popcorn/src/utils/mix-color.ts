import mix from './mix';
import { color, hsla, rgba, hex, Color } from 'style-value-types';
import { invariant } from 'hey-listen';

// Linear color space blending
// Explained https://www.youtube.com/watch?v=LKnqECcg6Gw
// Demonstrated http://codepen.io/osublake/pen/xGVVaN

const mixLinearColor = (from: number, to: number, v: number) => {
  const fromExpo = from * from;
  const toExpo = to * to;
  return Math.sqrt(v * (toExpo - fromExpo) + fromExpo);
};

const colorTypes = [hex, rgba, hsla];
const getColorType = (v: Color | string) =>
  colorTypes.find(type => type.test(v));

export default (from: Color | string, to: Color | string) => {
  const fromColorType = getColorType(from);
  const toColorType = getColorType(to);

  invariant(
    fromColorType.transform === toColorType.transform,
    'Both colors must be Hex and/or RGBA, or both must be HSLA'
  );

  const fromColor = fromColorType.parse(from);
  const toColor = toColorType.parse(to);
  const blended = { ...fromColor };

  // Only use the linear blending function for rgba and hex
  const mixFunc = fromColorType === hsla ? mix : mixLinearColor;

  return (v: number) => {
    for (const key in blended) {
      if (key !== 'alpha') {
        blended[key] = mixFunc(fromColor[key], toColor[key], v);
      }
    }

    blended.alpha = mix(fromColor.alpha, toColor.alpha, v);

    return fromColorType.transform(blended);
  };
};
