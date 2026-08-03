import * as Yup from "yup";

export const notifyMeSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  email: Yup.string().email().required().label("Email"),
  mobile: Yup.string().required().label("Mobile"),
  product: Yup.object().required().nullable().label("Product"),
  message: Yup.string().nullable().label("Message"),
});

export const notifyMeInitialValues: NotifyMeValues = {
  name: "",
  email: "",
  mobile: "",
  product: null,
  message: "",
};

export interface NotifyMeValues {
  name: string;
  email: string;
  mobile: string;
  product: {
    label: string;
    value: string;
    image?: string;
  } | null;
  message: string;
}
