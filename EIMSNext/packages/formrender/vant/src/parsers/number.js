const createNumberParser = (name) => ({
  name,
  toValue(value) {
    if (value === "" || value === undefined || value === null) return value;
    const number = Number(value);
    return Number.isNaN(number) ? value : number;
  },
});

export const number = createNumberParser("number");
export const inputNumber = createNumberParser("inputNumber");

export default number;
