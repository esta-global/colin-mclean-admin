import * as Yup from "yup";

export const materialSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  status: Yup.string().required().label("Status"),
});

export const materialInitialValues: MaterialValues = {
  name: "",
  status: "true",
};

export interface MaterialValues {
  name: string;
  status: string;
}
