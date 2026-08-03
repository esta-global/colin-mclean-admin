import * as Yup from "yup";

export const kycDocumentSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  formats: Yup.array().required().label("Formats"),
  status: Yup.string().required().label("Status"),
});

export const kycDocumentInitialValues: KycDocumentValues = {
  title: "",
  formats: null,
  status: "true",
};

export interface KycDocumentValues {
  title: string;
  formats:
    | {
        label: string;
        value: string;
      }[]
    | null;
  status: string;
}
