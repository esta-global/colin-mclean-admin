import * as Yup from "yup";

export const edgeSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  image: Yup.string().required().label("Image"),

  // priority: Yup.number().required().label("Priority"),

  shortDescription: Yup.string().label("Short Description"),

  status: Yup.string().label("Status"),
});

export const edgeInitialValues: EdgeValues = {
  name: "",
  image: "",

  // priority: 0,

  shortDescription: "",

  status: "true",
};

export interface EdgeValues {
  name: string;
  image: string;

  // priority: number;

  shortDescription: string;

  status: string;
}
