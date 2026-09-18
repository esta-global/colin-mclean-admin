export function Footer() {
  return (
    <footer className="footer cm-footer">
      <div className="d-sm-flex justify-content-center justify-content-sm-between align-items-center">
        <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
          Copyright © {new Date().getFullYear()}{" "}
          <strong className="text-dark">Colin McLean</strong> — Editorial Studio
        </span>
        <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center text-muted small">
          Crafted with care
        </span>
      </div>
    </footer>
  );
}
