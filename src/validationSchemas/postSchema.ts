import * as Yup from "yup";

export const postSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  slug: Yup.string().required().label("Slug"),
  content: Yup.string().required().label("Content"),
  excerpt: Yup.string().label("Excerpt"),
  coverImage: Yup.string().required().label("Cover Image"),

  author: Yup.object().required().label("Author"),
  category: Yup.object().required().label("Category"),

  tags: Yup.string().label("Tags"),

  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),

  status: Yup.string().label("Status"),
});

export const postInitialValues: PostValues = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",

  author: null,
  category: null,
  tags: "",

  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",

  status: "true",
};

export interface PostValues {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;

  author: {
    label: string;
    value: string;
  } | null;

  category: {
    label: string;
    value: string;
  } | null;

  tags: string;

  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;

  status: string;
}
