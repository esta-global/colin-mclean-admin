import * as Yup from "yup";

export interface BlogPageButton {
  text: string;
  url: string;
}

export interface BlogPageGuideItem {
  number: number;
  title: string;
  description: string;
}

export interface BlogPageValues {
  heroSection: {
    eyebrow: string;
    heading: string;
    description: string;
    buttons: {
      primary: BlogPageButton;
      secondary: BlogPageButton;
    };
    guideItems: BlogPageGuideItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyBlogGuideItem = (): BlogPageGuideItem => ({
  number: 0,
  title: "",
  description: "",
});

export const blogPageSchema = Yup.object({
  heroSection: Yup.object({
    eyebrow: stringField().required("Eyebrow is required"),
    heading: stringField().required("Heading is required"),
    description: stringField().required("Description is required"),
    buttons: Yup.object({
      primary: Yup.object({
        text: stringField().required("Primary button text is required"),
        url: stringField(),
      }),
      secondary: Yup.object({
        text: stringField().required("Secondary button text is required"),
        url: stringField(),
      }),
    }),
    guideItems: Yup.array().of(
      Yup.object({
        number: Yup.number().min(1, "Number must be at least 1").required("Number is required"),
        title: stringField().required("Guide title is required"),
        description: stringField().required("Guide description is required"),
      }),
    ),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const blogPageInitialValues: BlogPageValues = {
  heroSection: {
    eyebrow: "SIMPLESELLERS BLOG",
    heading: "Practical guides for faster, cleaner marketplace listings",
    description:
      "Learn how to photograph products, write searchable listings, price with confidence, and cross-list without creating the same work twice.",
    buttons: {
      primary: {
        text: "Generate a Listing",
        url: "/generate-listing",
      },
      secondary: {
        text: "Browse Guides",
        url: "/blog",
      },
    },
    guideItems: [
      {
        number: 1,
        title: "Better Inputs",
        description:
          "Photo and product-detail habits that make generated listings more accurate.",
      },
      {
        number: 2,
        title: "Marketplace Fit",
        description:
          "Platform-specific title, keyword, and category choices sellers can review quickly.",
      },
      {
        number: 3,
        title: "Repeatable Process",
        description:
          "Simple workflows for cross-listing, reviewing drafts, and publishing with confidence.",
      },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
