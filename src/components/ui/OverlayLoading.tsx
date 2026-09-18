interface OverlayLoadingProps {
  loading?: boolean;
}

export function OverlayLoading({ loading = true }: OverlayLoadingProps = {}) {
  if (!loading) return null;

  return (
    <div className="overlay-loading">
      <div
        className="spinner-border"
        role="status"
        style={{ color: "#ebc43d", width: "2.5rem", height: "2.5rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

