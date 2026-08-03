import * as Yup from "yup";

export const documentFormatSchema = Yup.object({
  format: Yup.object().required().label("Format"),
  mimeType: Yup.string().required().label("MIME Type"),
  status: Yup.string().required().label("Status"),
});

export const documentFormatInitialValues: DocumentFormatValues = {
  format: null,
  status: "true",
  mimeType: "",
};

export interface DocumentFormatValues {
  format: {
    label: string;
    value: string;
  } | null;
  status: string;
  mimeType: string;
}
