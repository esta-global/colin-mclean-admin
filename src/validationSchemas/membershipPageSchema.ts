import * as Yup from "yup";

export type MembershipPageSlug = "types-of-membership" | "become-a-member";

export interface MembershipCard {
  title: string;
  image: string;
  buttonText: string;
  pdfFile: string;
  sortOrder: number;
  status: boolean;
}

export interface MembershipPageValues {
  name: string;
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  introSection: {
    paragraphs: string[];
    highlightedText: string;
  };
  cardsSection: {
    cards: MembershipCard[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const membershipPages = [
  {
    slug: "types-of-membership" as const,
    label: "Types Of Membership",
    eyebrow: "Membership",
    needsPdf: false,
  },
  {
    slug: "become-a-member" as const,
    label: "Become A Member",
    eyebrow: "Membership",
    needsPdf: true,
  },
];

export const createEmptyMembershipCard = (sortOrder = 0, needsPdf = false): MembershipCard => ({
  title: "",
  image: "",
  buttonText: needsPdf ? "To apply for membership, download the form here" : "",
  pdfFile: "",
  sortOrder,
  status: true,
});

export const membershipPageSchema = Yup.object({
  name: stringField(),
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  introSection: Yup.object({
    paragraphs: Yup.array().of(stringField()),
    highlightedText: stringField(),
  }),
  cardsSection: Yup.object({
    cards: Yup.array().of(
      Yup.object({
        title: stringField(),
        image: stringField(),
        buttonText: stringField(),
        pdfFile: stringField(),
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

export const membershipPageInitialValuesBySlug: Record<MembershipPageSlug, MembershipPageValues> = {
  "types-of-membership": {
    name: "Types Of Membership",
    bannerSection: {
      title: "Types Of",
      highlightedTitle: "Membership",
      image: "",
    },
    introSection: {
      paragraphs: [
        "IFMA is committed to the growth and well-being of the Fan Industry and so fosters healthy two way relationships with all its stakeholders.",
        "The members are kept informed of the Government Policies likely to affect our business while enriching members with upgrades of their relevant knowledge through regular seminars and workshops.",
      ],
      highlightedText: "The Members to reach out for any query or help or assistance.",
    },
    cardsSection: {
      cards: [
        { ...createEmptyMembershipCard(1), title: "Primary Members" },
        { ...createEmptyMembershipCard(2), title: "Associate Members" },
      ],
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  },
  "become-a-member": {
    name: "Become A Member",
    bannerSection: {
      title: "Become",
      highlightedTitle: "A Member",
      image: "",
    },
    introSection: {
      paragraphs: [
        "Now that you all who are associated with Fan Industry know of the Benefits of being a Member, you have only to follow simple steps to be one.",
        "Just download the requisite form, provide details and you are on way to being considered for Membership.",
      ],
      highlightedText: "We are there to support you",
    },
    cardsSection: {
      cards: [
        { ...createEmptyMembershipCard(1, true), title: "Primary Members" },
        { ...createEmptyMembershipCard(2, true), title: "Associate Members" },
      ],
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  },
};
