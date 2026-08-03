export function Footer() {
  return (
    <footer className="footer">
      <div className="d-sm-flex justify-content-center justify-content-sm-between">
        <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
          Copyright ©
          <a href="https://www.estaglobal.in/" target="_blank">
            IFMA
          </a>
        </span>
        <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
          Developed By
          <a href="https://www.estaglobal.in/" target="_blank">
            {` Esta Global`}
          </a>
        </span>
      </div>
    </footer>
  );
}
