import * as Yup from "yup";

export const inquirySchema = Yup.object({
  name: Yup.string().required().label("Name"),
  email: Yup.string().email().required().label("Email"),
  mobile: Yup.string().required().label("Mobile"),
  message: Yup.string().label("Message"),

  country: Yup.object().nullable().label("Country"),
  position: Yup.string().label("Position"),

  inquiryStatus: Yup.string().label("Inquiry Status"),
});

export const inquiryInitialValues: InquiryValues = {
  name: "",
  email: "",
  mobile: "",
  message: "",
  country: null,
  position: "ADMIN",
  inquiryStatus: "PENDING",
};

export interface InquiryValues {
  name: string;
  email: string;
  mobile: string;
  message: string;

  country: {
    label: string;
    value: string;
  } | null;
  position: string;

  inquiryStatus: string;
}
