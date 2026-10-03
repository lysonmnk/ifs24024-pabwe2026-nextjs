import { useState, ChangeEvent } from "react";

export type UseInputResult = [
  string,
  (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => void,
  (val: string) => void
] & {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => void;
  setValue: (val: string) => void;
  reset: () => void;
};

export function useInput(defaultValue: string = ""): UseInputResult {
  const [value, setValue] = useState(defaultValue);

  const handleValueChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    if (typeof e === "string") {
      setValue(e);
    } else {
      setValue(e.target.value);
    }
  };

  const reset = () => setValue(defaultValue);

  const result = [value, handleValueChange, setValue] as UseInputResult;
  result.value = value;
  result.onChange = handleValueChange;
  result.setValue = setValue;
  result.reset = reset;

  return result;
}
