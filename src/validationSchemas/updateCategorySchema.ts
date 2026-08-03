import * as Yup from "yup";

export const categorySchema = Yup.object({
  name: Yup.string().required().label("Name"),
  slug: Yup.string().required().label("Slug"),
  shortDescription: Yup.string().label("Short Description"),
  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),
  status: Yup.boolean().label("Status"),
});

export const categoryInitialValues: CategoryValues = {
  name: "",
  slug: "",
  shortDescription: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  status: false,
};

export interface CategoryValues {
  name: string;
  slug: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: boolean;
}
