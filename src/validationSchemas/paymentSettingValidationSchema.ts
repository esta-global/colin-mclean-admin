import * as Yup from "yup";

export const paymentSettingSchema = Yup.object({
  company: Yup.object().required().label("Company"),
  apiKey: Yup.string().required().label("API Key"),
  apiSecret: Yup.string().required().label("API Secret"),
  merchantId: Yup.string().label("Merchant ID"),
  status: Yup.string().required().label("Status"),
});

export const paymentSettingInitialValues: PaymentSettingValues = {
  company: null,
  apiKey: "",
  apiSecret: "",
  merchantId: "",
  status: "true",
};

export interface PaymentSettingValues {
  company: {
    label: string;
    value: string;
  } | null;
  apiKey: string;
  apiSecret: string;
  merchantId: string;
  status: string;
}
