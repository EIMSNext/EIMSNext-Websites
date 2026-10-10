export interface PasswordStrengthState {
  hasLength: boolean;
  hasCategoryCount: boolean;
}

const uppercaseRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const digitRegex = /\d/;
const specialCharRegex = /[^A-Za-z0-9]/;

export function getPasswordStrengthState(password: string): PasswordStrengthState {
  const value = password ?? "";
  const categories = [
    uppercaseRegex.test(value),
    lowercaseRegex.test(value),
    digitRegex.test(value),
    specialCharRegex.test(value),
  ].filter(Boolean).length;

  return {
    hasLength: value.length >= 8 && value.length <= 30,
    hasCategoryCount: categories >= 3,
  };
}

export function isStrongPassword(password: string): boolean {
  const state = getPasswordStrengthState(password);
  return state.hasLength && state.hasCategoryCount;
}
