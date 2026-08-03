import * as Yup from "yup";

export const createPasswordSchema: Yup.Schema = Yup.object().shape({
  password: Yup.string().required().min(6).label("Password"),
  cPassword: Yup.string().required().min(6).label("Confirm Password"),
});

type InitialValue = {
  password: string;
  cPassword: string;
};

export const initialValues: InitialValue = {
  password: "",
  cPassword: "",
};
