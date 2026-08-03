import * as Yup from "yup";

export const programDurationSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  slug: Yup.string().required().label("Slug"),
  days: Yup.string().required().label("Days"),
  status: Yup.bool().label("Status"),
});

export const programDurationInitialValues: ProgramDurarionValues = {
  name: "",
  slug: "",
  days: "0",
  status: "true",
};

export interface ProgramDurarionValues {
  name: string;
  slug: string;
  days: string;
  status: string;
}
