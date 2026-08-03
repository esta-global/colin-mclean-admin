export function Spinner(props: PropsType) {
  return (
    <div className="d-flex align-items-center gap-1 text-muted">
      <div
        className="spinner-border spinner-border-sm"
        aria-hidden="true"
      ></div>
      <span role="status">{props.text}</span>
    </div>
  );
}

type PropsType = { text: String };
