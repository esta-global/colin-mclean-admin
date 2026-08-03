import { useNavigate } from "react-router-dom";
import { goBack } from "../../utills";

export function GoBackButton() {
  const navigate = useNavigate();
  return (
    <>
      <button
        title="Alt+Backspace"
        onClick={() => {
          goBack(navigate);
        }}
        className="navigation-btn"
      >
        <i className="ti-arrow-left"></i>
      </button>
    </>
  );
}
