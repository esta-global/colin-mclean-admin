import React from "react";

export function InputBox(props: PropsType) {
  const onChange = props.handleChange || props.onChange;
  const onBlur = props.handleBlur || props.onBlur;

  return (
    <>
      {props.label ? (
        <label htmlFor={props.name} className="form-label post-form-field-label">
          {props.label}
          {props.required ? <span className="text-danger"> *</span> : null}
        </label>
      ) : null}
      <input
        type={props.type || "text"}
        name={props.name}
        value={props.value ?? ""}
        className="form-control"
        id={props.name}
        placeholder={props.placeholder}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={props.readonly}
      />

      {props.error && props.touched ? (
        <p className="custom-form-error text-danger">{props.error}</p>
      ) : null}
    </>
  );
}

type PropsType = {
  label?: string;
  placeholder?: string;
  type?: "number" | "text" | "email" | "tel" | "date" | "password" | "url" | string;
  name: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string | number;
  required?: boolean;
  error?: string;
  touched?: boolean;
  readonly?: boolean;
};
