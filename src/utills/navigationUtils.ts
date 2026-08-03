import { NavigateFunction } from "react-router-dom";

export function goBack(navigate: NavigateFunction) {
  navigate(-1);
}

export function goForward(navigate: NavigateFunction) {
  navigate(1);
}

export function goTo(navigate: NavigateFunction, path: string) {
  navigate(path);
}
