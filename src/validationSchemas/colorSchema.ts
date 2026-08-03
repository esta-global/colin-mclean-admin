import * as Yup from "yup";

export const colorSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  code: Yup.string().label("Code"),
  anotherCode: Yup.string().label("Code 2"),
  image: Yup.string().label("Image"),
  // categories: Yup.array().nullable().label("Categories").required(),

  status: Yup.string().required().label("Status"),
});

export const colorInitialValues: ColorValues = {
  name: "",
  code: "",
  anotherCode: "",
  image: "",
  // categories: null,
  status: "true",
};

export interface ColorValues {
  name: string;
  code: string;
  anotherCode: string;
  image: string;
  // categories:
  //   | {
  //       label: string;
  //       value: string;
  //     }[]
  //   | null;

  status: string;
}
