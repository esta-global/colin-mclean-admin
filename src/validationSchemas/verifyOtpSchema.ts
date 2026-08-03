import * as Yup from "yup";

export const verigyOtpSchema: Yup.Schema = Yup.object().shape({
  otp: Yup.string().min(4).max(4).required().label("OTP"),
});

type InitialValue = {
  otp: string;
};

export const initialValues: InitialValue = {
  otp: "",
};
