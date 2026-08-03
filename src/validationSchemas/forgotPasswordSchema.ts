import * as Yup from "yup";

export const forgotPasswordSchema: Yup.Schema = Yup.object().shape({
  email: Yup.string().email().required().label("Email"),
});

type InitialValue = {
  email: string;
};

export const initialValues: InitialValue = {
  email: "",
};
