import * as Yup from "yup";

export const orderSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  email: Yup.string().email().required().label("Email"),
  mobile: Yup.string().required().label("Mobile"),

  address: Yup.string().label("Address"),
  locality: Yup.string().label("Locality"),
  city: Yup.string().label("City"),
  state: Yup.string().label("State"),
  country: Yup.string().label("Country"),
  pincode: Yup.string().length(6).label("Pincode"),

  orderStatus: Yup.object().label("ORDER_PLACED"),
});

export const orderInitialValues: OrderValues = {
  name: "",
  email: "",
  mobile: "",

  address: "",
  locality: "",
  city: "",
  state: "",
  country: "",
  pincode: "",

  orderStatus: null,
};

export interface OrderValues {
  name: string;
  email: string;
  mobile: string;

  address: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  orderStatus: {
    label: string;
    value: string;
  } | null;
}
