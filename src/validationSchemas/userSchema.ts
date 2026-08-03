import * as Yup from "yup";

export const userSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  email: Yup.string().email().required().label("Email"),
  mobile: Yup.string().required().label("Mobile"),
  status: Yup.string().label("Status"),
});

export const userInitialValues: UserValues = {
  name: "",
  email: "",
  mobile: "",
  status: "true",
};

export interface UserValues {
  name: string;
  email: string;
  mobile: string;
  status: string;
}
