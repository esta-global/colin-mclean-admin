import * as Yup from "yup";

export const featuresSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  slug: Yup.string().required().label("Slug"),
  image: Yup.string().required().label("Image"),

  // priority: Yup.number().required().label("Priority"),

  shortDescription: Yup.string().label("Short Description"),

  status: Yup.string().label("Status"),
});

export const featuresInitialValues: FeaturesValues = {
  name: "",
  slug: "",
  image: "",

  // priority: 0,

  shortDescription: "",

  status: "true",
};

export interface FeaturesValues {
  name: string;
  slug: string;
  image: string;

  // priority: number;

  shortDescription: string;

  status: string;
}
