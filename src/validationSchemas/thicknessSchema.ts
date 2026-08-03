import * as Yup from "yup";

export const thicknessSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  status: Yup.string().required().label("Status"),
});

export const thicknessInitialValues: ThicknessValues = {
  name: "",
  status: "true",
};

export interface ThicknessValues {
  name: string;
  status: string;
}
