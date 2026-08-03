import * as Yup from "yup";

export const productSchema = Yup.object({
  name: Yup.string().required().label("Name"),
  slug: Yup.string().required().label("Slug"),

  category: Yup.object().required().label("Category"),
  subCategory: Yup.object().nullable().label("Sub Category"),

  sku: Yup.string().required().label("SKU"),

  image: Yup.string().required().label("Default Image"),
  video: Yup.string().label("Video"),
  bestSeller: Yup.string().label("Best Seller"),

  features: Yup.array().optional().nullable().label("Features"),
  certifications: Yup.array().optional().nullable().label("Certifications"),
  descriptions: Yup.string().label("Descriptions"),
  shortDescriptions: Yup.string().label("Short Descriptions"),
  benefits: Yup.string().label("Benefits"),
  exploreProducts: Yup.array().optional().nullable().label("Explore Products"),

  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),
  tags: Yup.string().label("Tags"),

  status: Yup.string().required().label("Status"),
});

export const productInitialValues: ProductValues = {
  name: "",
  slug: "",
  category: null,
  subCategory: null,

  sku: "",

  image: "",
  video: "",
  bestSeller: "",
  // images: null,

  features: null,
  certifications: null,
  descriptions: "",
  shortDescriptions: "",
  specifications: "",
  benefits: "",
  exploreProducts: null,

  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  tags: "",

  status: "true",
};

export interface ProductValues {
  name: string;
  slug: string;
  category: {
    label: string;
    value: string;
  } | null;

  subCategory: {
    label: string;
    value: string;
  } | null;

  sku: string;

  image: string;
  video: string;
  bestSeller: string;

  features:
    | {
        label: string;
        value: string;
      }[]
    | null;

  certifications:
    | {
        label: string;
        value: string;
      }[]
    | null;

  descriptions: string;
  shortDescriptions: string;
  specifications: string;
  benefits: string;

  exploreProducts:
    | {
        label: string;
        value: string;
      }[]
    | null;

  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  tags: string;

  status: string;
}

export type FileType = {
  fieldname: string;
  encoding: string;
  originalname: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: string;
  filepath: string;
};
