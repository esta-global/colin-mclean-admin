import React from "react";

export function InputBox(props: PropsType) {
  return (
    <>
      <label htmlFor={props.name}>
        {props.label}
        {props.required ? <span className="text-danger"> *</span> : null}
      </label>
      <input
        type={props.type}
        name={props.name}
        value={props.value}
        className="form-control"
        id={props.name}
        placeholder={props.placeholder}
        onChange={props.handleChange}
        onBlur={props.handleBlur}
        readOnly={props.readonly}
      />

      {props.error && props.touched ? (
        <p className="custom-form-error text-danger">{props.error}</p>
      ) : null}
    </>
  );
}

type PropsType = {
  label: string;
  placeholder?: string;
  type: "number" | "text" | "email" | "tel" | "date" | "password" | "url";
  name: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string | number;
  required?: boolean;
  error?: string;
  touched?: boolean;
  readonly?: boolean;
};
