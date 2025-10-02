import { customAlphabet } from "nanoid";
const customNanoid16 = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  15
);
const customNanoid36 = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  35
);

export function uniqueId36() {
  //补一个前缀防止数字开头报错
  return "j" + customNanoid36();
}

export function uniqueId() {
  //补一个前缀防止数字开头报错
  return "j" + customNanoid16();
}
