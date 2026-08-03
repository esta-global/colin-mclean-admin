import React from "react";

export function TextareaBox(props: PropsType) {
  return (
    <>
      <label htmlFor={props.name}>{props.label}</label>
      <textarea
        name={props.name}
        className="form-control"
        id={props.name}
        placeholder={props.placeholder}
        onChange={props.handleChange}
        onBlur={props.handleBlur}
        value={props.value}
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
  name: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  value: string;
  error?: string;
  touched?: boolean;
};
