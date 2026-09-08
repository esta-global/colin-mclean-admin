import * as Yup from "yup";

export interface PastEventItem {
  title: string;
  image: string;
  sortOrder: number;
  status: boolean;
}

export interface PastEventsPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  eventsSection: {
    heading: string;
    events: PastEventItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyPastEvent = (sortOrder = 0): PastEventItem => ({
  title: "",
  image: "",
  sortOrder,
  status: true,
});

export const pastEventsPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  eventsSection: Yup.object({
    heading: stringField(),
    events: Yup.array().of(
      Yup.object({
        title: stringField(),
        image: stringField(),
        sortOrder: Yup.number(),
        status: Yup.boolean(),
      }),
    ),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const pastEventsPageInitialValues: PastEventsPageValues = {
  bannerSection: {
    title: "Past",
    highlightedTitle: "Events",
    image: "",
  },
  eventsSection: {
    heading: "Past Events",
    events: [
      {
        ...createEmptyPastEvent(1),
        title: "Mr. Gurmeet Chawla and Mr. Harinder Singh recognize Mr. Vinay Mirchandani's outstanding contribution to IFMA.",
      },
      {
        ...createEmptyPastEvent(2),
        title: "Chairman, Mr. Gaurav Dhawan honours Mr. Ramesh Chandran, Member, CLASP.",
      },
      {
        ...createEmptyPastEvent(3),
        title: "Industry experts discuss the Regulatory & Standards Landscape in the technical session.",
      },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
