import * as Yup from "yup";

export const carouselSchema = Yup.object({
  title: Yup.string().label("Title"),
  subTitle: Yup.string().label("Sub Title"),
  targetDevice: Yup.string().label("Target Device"),
  mediaType: Yup.string()
    .oneOf(["IMAGE", "VIDEO"])
    .required()
    .label("Media Type"),

  image: Yup.string().when("mediaType", {
    is: "IMAGE",
    then: (schema) => schema.required("Image is required"),
    otherwise: (schema) => schema,
  }),
  video: Yup.string().when("mediaType", {
    is: "VIDEO",
    then: (schema) => schema.required("Video is required"),
    otherwise: (schema) => schema,
  }),

  shortDescription: Yup.string().label("Short Description"),
  buttonText: Yup.string().label("Button Text"),
  buttonLink: Yup.string().label("Button Link"),
  status: Yup.string().label("Status"),
});

export const carouselInitialValues: CarouselValues = {
  title: "",
  subTitle: "",
  targetDevice: "DESKTOP",
  mediaType: "IMAGE",
  image: "",
  video: "",
  shortDescription: "",
  buttonText: "",
  buttonLink: "",
  status: "true",
};

export interface CarouselValues {
  title: string;
  subTitle: string;
  targetDevice: string;
  mediaType: "IMAGE" | "VIDEO";
  image: string;
  video: string;
  shortDescription: string;
  buttonText: string;
  buttonLink: string;
  status: string;
}
