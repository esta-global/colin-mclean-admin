import * as Yup from "yup";

export const categorySchema = Yup.object({
  name: Yup.string().required().label("Name"),
  slug: Yup.string().required().label("Slug"),

  priority: Yup.number().required().label("Priority"),
  heading: Yup.string().label("Hero Heading"),
  subheading: Yup.string().label("Hero Subheading"),
  eyebrow: Yup.string().label("Eyebrow Tag"),
  image: Yup.string().label("Category Image"),

  showInNavbar: Yup.boolean().label("Show in Navbar"),
  showInFooter: Yup.boolean().label("Show in Footer"),

  shortDescription: Yup.string().label("Short Description"),

  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),

  status: Yup.string().label("Status"),
});

export const categoryInitialValues: CategoryValues = {
  name: "",
  slug: "",

  priority: 0,
  heading: "",
  subheading: "",
  eyebrow: "",
  image: "",

  showInNavbar: true,
  showInFooter: true,

  shortDescription: "",

  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",

  status: "true",
};

export interface CategoryValues {
  name: string;
  slug: string;

  priority: number;
  heading?: string;
  subheading?: string;
  eyebrow?: string;
  image?: string;

  showInNavbar?: boolean;
  showInFooter?: boolean;

  shortDescription: string;

  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;

  status: string;
}

