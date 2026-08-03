import * as Yup from "yup";

export const loginSchema: Yup.Schema = Yup.object().shape({
  email: Yup.string().email().required().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});

type InitialValue = {
  email: string;
  password: string;
};

export const initialValues: InitialValue = {
  email: "",
  password: "",
};
