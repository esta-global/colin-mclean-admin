import * as Yup from "yup";

export const sizeFinishSchema = Yup.object({
  size: Yup.object().required().label("Size"),
  finishes: Yup.array().required().label("Finishes"),
  status: Yup.string().required().label("Status"),
});

export const sizeFinishInitialValues: SizeFinishValues = {
  size: null,
  finishes: null,
  status: "true",
};

export interface SizeFinishValues {
  size: {
    label: string;
    value: string;
  } | null;
  finishes:
    | {
        label: string;
        value: string;
      }[]
    | null;
  status: string;
}
