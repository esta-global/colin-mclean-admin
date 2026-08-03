import * as Yup from "yup";

export const shapeSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  status: Yup.string().required().label("Status"),
});

export const shapeInitialValues: ShapeValues = {
  name: "",
  status: "true",
};

export interface ShapeValues {
  name: string;
  status: string;
}
