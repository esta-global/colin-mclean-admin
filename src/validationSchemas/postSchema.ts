import * as Yup from "yup";

export type ContentType = "blog" | "essay";
export type BlogSectionType =
  | "heading"
  | "text"
  | "fullImage"
  | "imageGrid"
  | "imageTextLeft"
  | "imageTextRight";

export interface BlogSectionImage {
  image: string;
  title: string;
}

export interface BlogSection {
  id: string;
  type: BlogSectionType;
  heading: string;
  text: string;
  image: string;
  imageTitle: string;
  columns: "2" | "3";
  images: BlogSectionImage[];
}

export const postSchema = Yup.object({
  type: Yup.string().oneOf(["blog", "essay"]).required().label("Type"),
  title: Yup.string().required().label("Title"),
  slug: Yup.string().required().label("Slug"),
  content: Yup.string().label("Content"),
  excerpt: Yup.string().label("Excerpt"),
  coverImage: Yup.string().required().label("Cover Image"),

  author: Yup.object().nullable().notRequired().label("Author"),
  category: Yup.object().required().label("Category"),

  tags: Yup.string().label("Tags"),

  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),

  status: Yup.string().label("Status"),
  featured: Yup.boolean().label("Featured"),
});

export const postInitialValues: PostValues = {
  type: "blog",
  title: "",
  slug: "",
  content: "",
  schemaData: "",
  blogSections: [],
  excerpt: "",
  coverImage: "",

  author: null,
  category: null,
  tags: "",

  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",

  status: "true",
  featured: false,
};

export interface PostValues {
  type: ContentType;
  title: string;
  slug: string;
  content: string;
  schemaData: string;
  blogSections: BlogSection[];
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
  featured: boolean;
}
