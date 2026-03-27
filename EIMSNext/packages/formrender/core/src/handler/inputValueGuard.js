export const normalizeInputValue = ({
  currentValue,
  incomingValue,
  incomingFormValue,
  originValue,
  lastManualValue,
  setFlag,
}) => {
  if (setFlag) {
    return {
      value: incomingValue,
      formValue: incomingFormValue,
      lastManualValue,
    };
  }

  const nextLastManualValue =
    lastManualValue === undefined ? currentValue : lastManualValue;
  const isReset =
    incomingValue === originValue && incomingValue !== nextLastManualValue;

  if (isReset) {
    return {
      value: nextLastManualValue,
      formValue: nextLastManualValue,
      lastManualValue: nextLastManualValue,
    };
  }

  return {
    value: incomingValue,
    formValue: incomingFormValue,
    lastManualValue: incomingValue,
  };
};
