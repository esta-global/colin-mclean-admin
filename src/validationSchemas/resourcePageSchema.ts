import * as Yup from "yup";

export const resourcePageSchema = Yup.object({
  pageTitle: Yup.string().label("Breadcrumb Title"),

  breadcrumbTitle: Yup.string().label("Breadcrumb Title"),
  breadcrumbBanner: Yup.string().label("Page Content"),

  // First Section
  catalogTitle: Yup.string().label("Catalog Title"),
  catalogFile: Yup.string().label("Catalog File"),

  contactUsTitle: Yup.string().label("Contact Us Title"),
  callUsTitle: Yup.string().label("Call Us Title"),
  contactUsMobile: Yup.string().label("Contact Us Mobile"),

  // Meta
  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),
});

export const resourcePageInitialValues: ResourcePageValues = {
  pageTitle: "",
  breadcrumbTitle: "",
  breadcrumbBanner: "",

  catalogTitle: "",
  catalogFile: "",

  contactUsTitle: "",
  callUsTitle: "",
  contactUsMobile: "",

  // Meta
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

export interface ResourcePageValues {
  pageTitle: string;

  breadcrumbTitle: string;
  breadcrumbBanner: string;

  catalogTitle: string;
  catalogFile: string;

  contactUsTitle: string;
  callUsTitle: string;
  contactUsMobile: string;

  // Meta
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}
