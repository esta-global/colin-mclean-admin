import React from "react";

export function TextareaBox(props: PropsType) {
  const onChange = props.handleChange || props.onChange;
  const onBlur = props.handleBlur || props.onBlur;

  return (
    <>
      {props.label ? <label htmlFor={props.name}>{props.label}</label> : null}
      <textarea
        name={props.name}
        className="form-control"
        id={props.name}
        placeholder={props.placeholder}
        onChange={onChange}
        onBlur={onBlur}
        value={props.value ?? ""}
        rows={props.rows}
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
  name: string;
  handleChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  value: string;
  error?: string;
  touched?: boolean;
  rows?: number;
};
