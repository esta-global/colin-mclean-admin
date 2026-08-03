import * as Yup from "yup";

export const categoryShowcaseSchema = Yup.object({
  title: Yup.string().label("Title"),
  subTitle: Yup.string().label("Sub Title"),
  position: Yup.string().label("Position"),
  image: Yup.string().required().label("Image"),
  shortDescription: Yup.string().label("Short Description"),
  buttonText: Yup.string().label("Button Text"),
  buttonLink: Yup.string().label("Button Link"),
  status: Yup.string().label("Status"),
});

export const categoryShowcaseInitialValues: CategoryShowcaseValues = {
  title: "",
  subTitle: "",
  position: "",
  image: "",
  shortDescription: "",
  buttonText: "",
  buttonLink: "",
  status: "true",
};

export interface CategoryShowcaseValues {
  title: string;
  subTitle: string;
  position: string;
  image: string;
  shortDescription: string;
  buttonText: string;
  buttonLink: string;
  status: string;
}
