export class Indexed<Item> {
  [index: number]: Item;
  length: number;
}

export function arrayify<Item>(indexed: Indexed<Item>) {
  let result = new Array<Item>(indexed.length);
  for (let i = 0; i < indexed.length; ++i) {
    result[i] = indexed[i];
  }
  return result;
}

export function random() {
  // Generate 8 bytes.
  let ints = new Uint8Array(8);
  crypto.getRandomValues(ints);
  // Manipulate exponent and sign.
  ints[7] = 0x3f;
  ints[6] |= 0xf0;
  // Read as little-endian double, and subtract 1 for just fraction.
  return new DataView(ints.buffer).getFloat64(0, true) - 1;
}

export function sum(numbers: Iterable<number>) {
  let sum = 0;
  for (let number of numbers) {
    sum += number;
  }
  return sum;
}
