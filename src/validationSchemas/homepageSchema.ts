import * as Yup from "yup";

const stringField = () => Yup.string().nullable();
const numberField = () =>
  Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value,
    );
const booleanField = () => Yup.boolean().nullable();

export interface Badge {
  text: string;
}

export interface Button {
  text: string;
  url: string;
}

export interface HeroHeading {
  line1: string;
  line2: string;
  highlight: string;
}

export interface TrustItem {
  text: string;
}

export interface UploadPreview {
  title: string;
  image: string;
}

export interface AiProcessStep {
  label: string;
  completed: boolean;
}

export interface TrustedByLogo {
  name: string;
  image: string;
  url: string;
}

export interface VideoItem {
  title: string;
  description: string;
  url: string;
}

export interface HomepageValues {
  trustedBySection: {
    title: string;
    logos: TrustedByLogo[];
  };
  videoSection: {
    items: VideoItem[];
  };
  onAirSection: {
    title: string;
    urls: string[];
  };
  storyVideoSection: {
    thumbnail: string;
    url: string;
  };
  chairmanMessageSection: {
    heading: string;
    name: string;
    designation: string;
    message: string;
    image: string;
    button: Button;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export const createEmptyTrustItem = (): TrustItem => ({
  text: "",
});

export const createEmptyUploadPreview = (): UploadPreview => ({
  title: "",
  image: "",
});

export const createEmptyAiProcessStep = (): AiProcessStep => ({
  label: "",
  completed: false,
});

export const createEmptyTrustedByLogo = (): TrustedByLogo => ({
  name: "",
  image: "",
  url: "",
});

export const createEmptyVideoItem = (): VideoItem => ({
  title: "",
  description: "",
  url: "",
});

const badgeSchema = Yup.object({
  text: stringField(),
});

const buttonSchema = Yup.object({
  text: stringField(),
  url: stringField(),
});

export const homepageSchema = Yup.object({
  trustedBySection: Yup.object({
    title: stringField(),
    logos: Yup.array().of(
      Yup.object({
        name: stringField(),
        image: stringField(),
        url: stringField(),
      }),
    ),
  }),
  videoSection: Yup.object({
    items: Yup.array().of(
      Yup.object({
        title: stringField(),
        description: stringField(),
        url: stringField(),
      }),
    ),
  }),
  onAirSection: Yup.object({
    title: stringField(),
    urls: Yup.array().of(stringField()),
  }),
  storyVideoSection: Yup.object({
    thumbnail: stringField(),
    url: stringField(),
  }),
  chairmanMessageSection: Yup.object({
    heading: stringField(),
    name: stringField(),
    designation: stringField(),
    message: stringField(),
    image: stringField(),
    button: buttonSchema,
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const homepageInitialValues: HomepageValues = {
  trustedBySection: {
    title: "Trusted Brands",
    logos: [
      { name: "Havells", image: "", url: "" },
      { name: "Crompton", image: "", url: "" },
      { name: "Orient Electric", image: "", url: "" },
      { name: "Luker", image: "", url: "" },
    ],
  },
  videoSection: {
    items: [
      {
        title: "Coffee Table Book Launch At AGM 2025",
        description:
          "Add a short description for this YouTube video or event highlight.",
        url: "",
      },
      {
        title: "Lifetime Contribution Award",
        description:
          "Use this card for awards, event clips, product videos, or announcements.",
        url: "",
      },
      {
        title: "Fireside Chat",
        description:
          "Add the YouTube URL and update the title or description anytime.",
        url: "",
      },
    ],
  },
  onAirSection: {
    title: "IFMA On Air",
    urls: [""],
  },
  storyVideoSection: {
    thumbnail: "",
    url: "",
  },
  chairmanMessageSection: {
    heading: "Message from Chairman",
    name: "",
    designation: "",
    message: "",
    image: "",
    button: {
      text: "Read More",
      url: "",
    },
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
