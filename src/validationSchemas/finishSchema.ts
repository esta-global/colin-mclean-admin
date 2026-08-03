import * as Yup from "yup";

export const finishSchema = Yup.object({
  shortName: Yup.string().required().label("Short Name"),
  fullName: Yup.string().required().label("Full Name"),
  status: Yup.string().required().label("Status"),
});

export const finishInitialValues: FinishValues = {
  shortName: "",
  fullName: "",
  status: "true",
};

export interface FinishValues {
  shortName: string;
  fullName: string;
  status: string;
}
