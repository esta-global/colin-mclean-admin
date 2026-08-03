export function SubmitButton(props: PropsType) {
  return (
    <button
      className="btn btn-primary text-light"
      type="submit"
      disabled={props.loading}
    >
      {props.loading ? (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
      ) : null}
      {props.loading ? ` Loading...` : props.text}
    </button>
  );
}

type PropsType = {
  className?: string;
  loading: boolean;
  text: string;
};
