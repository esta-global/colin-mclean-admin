import * as Yup from "yup";

export const sizeSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  status: Yup.string().required().label("Status"),
});

export const sizeInitialValues: SizeValues = {
  title: "",
  status: "true",
};

export interface SizeValues {
  title: string;
  status: string;
}
