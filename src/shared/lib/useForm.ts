import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends object>(initialValues: T, validate: (values: T) => FormErrors<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const allErrors = useMemo(() => validate(values), [validate, values]);
  const isValid = useMemo(() => Object.values(allErrors).every((message) => !message), [allErrors]);

  const errors = useMemo(() => {
    const visible: FormErrors<T> = {};
    (Object.keys(allErrors) as Array<keyof T>).forEach((key) => {
      if ((submitted || touched[key]) && allErrors[key]) visible[key] = allErrors[key];
    });
    return visible;
  }, [allErrors, submitted, touched]);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const touch = useCallback((key: keyof T) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const field = (key: keyof T) => ({
    name: String(key),
    value: String(values[key] ?? ""),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue(key, event.target.value as T[keyof T]),
    onBlur: () => touch(key),
    error: Boolean(errors[key]),
    helperText: errors[key],
  });

  const handleSubmit = (onValid: (values: T) => void | Promise<void>) => (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (isValid) void onValid(values);
  };

  const reset = useCallback(
    (nextValues?: T) => {
      setValues(nextValues ?? initialValues);
      setTouched({});
      setSubmitted(false);
    },
    [initialValues],
  );

  return { values, errors, isValid, setValue, touch, field, handleSubmit, reset };
}
