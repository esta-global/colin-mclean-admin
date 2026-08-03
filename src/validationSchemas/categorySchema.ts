import * as Yup from "yup";

export const categorySchema = Yup.object({
  name: Yup.string().required().label("Name"),
  slug: Yup.string().required().label("Slug"),
  image: Yup.string().required().label("Image"),

  textOverImage: Yup.string().label("Text Over Image"),
  buttonText: Yup.string().label("Button Text"),

  priority: Yup.number().required().label("Priority"),
  shortDescription: Yup.string().label("Short Description"),

  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),

  listingTitle: Yup.string().label("Listing Title"),
  listingImage: Yup.string().label("Listing Image"),
  listingDescription: Yup.string().label("Listing Description"),

  status: Yup.string().label("Status"),
});

export const categoryInitialValues: CategoryValues = {
  name: "",
  slug: "",
  image: "",

  textOverImage: "",
  buttonText: "",

  priority: 0,
  shortDescription: "",

  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",

  listingTitle: "",
  listingImage: "",
  listingDescription: "",
  status: "true",
};

export interface CategoryValues {
  name: string;
  slug: string;
  image: string;

  textOverImage: string;
  buttonText: string;

  priority: number;
  shortDescription: string;

  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;

  listingTitle: string;
  listingImage: string;
  listingDescription: string;

  status: string;
}
