import { customAlphabet } from "nanoid";
const customNanoid8 = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 7);
const customNanoid16 = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  15
);
const customNanoid36 = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  35
);
const randomLetter = () => {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26));
};
export function uniqueId36() {
  return randomLetter() + customNanoid36();
}

export function uniqueId() {
  //补一个前缀防止数字开头报错
  return randomLetter() + customNanoid16();
}

export function uniqueId8() {
  return randomLetter() + customNanoid8();
}
