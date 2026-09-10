import * as Yup from "yup";

export interface SubCommittee {
  committeeName: string;
  headName: string;
  headCompany: string;
  image: string;
  teamMembers: string[];
  sortOrder: number;
}

export interface SubCommitteesPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  introSection: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    text: string;
    paragraphs: string[];
    highlightText: string;
  };
  committeesSection: {
    eyebrow: string;
    heading: string;
    highlightedHeading: string;
    description: string;
    committees: SubCommittee[];
  };
  ctaSection: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    description: string;
    primaryButtonText: string;
    primaryButtonUrl: string;
    secondaryButtonText: string;
    secondaryButtonUrl: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptySubCommittee = (): SubCommittee => ({
  committeeName: "",
  headName: "",
  headCompany: "",
  image: "",
  teamMembers: [],
  sortOrder: 0,
});

export const subCommitteesPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  introSection: Yup.object({
    eyebrow: stringField(),
    title: stringField(),
    highlightedTitle: stringField(),
    text: stringField(),
    paragraphs: Yup.array().of(stringField()),
    highlightText: stringField(),
  }),
  committeesSection: Yup.object({
    eyebrow: stringField(),
    heading: stringField(),
    highlightedHeading: stringField(),
    description: stringField(),
    committees: Yup.array().of(
      Yup.object({
        committeeName: stringField(),
        headName: stringField(),
        headCompany: stringField(),
        image: stringField(),
        teamMembers: Yup.array().of(stringField()),
        sortOrder: Yup.number().min(0),
      }),
    ),
  }),
  ctaSection: Yup.object({
    eyebrow: stringField(),
    title: stringField(),
    highlightedTitle: stringField(),
    description: stringField(),
    primaryButtonText: stringField(),
    primaryButtonUrl: stringField(),
    secondaryButtonText: stringField(),
    secondaryButtonUrl: stringField(),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const subCommitteesPageInitialValues: SubCommitteesPageValues = {
  bannerSection: {
    title: "Sub",
    highlightedTitle: "Committees",
    image: "",
  },
  introSection: {
    eyebrow: "Working Together",
    title: "Expertise That Moves.",
    highlightedTitle: "The Industry Forward.",
    text:
      "To enable specific focus to be provided to few important subjects, IFMA has constituted Sub-Committees headed by experts in that field. The Team Heads are ably supported by members of same discipline expertise as required.",
    paragraphs: [
      "To enable specific focus to be provided to few important subjects, IFMA has constituted Sub-Committees headed by experts in that field. The Team Heads are ably supported by members of same discipline expertise as required.",
      "They also represent various Member Companies and so their valued inputs become more universally accepted",
    ],
    highlightText: "We are proud of the contribution of each one of them.",
  },
  committeesSection: {
    eyebrow: "Our Committees",
    heading: "Collective Expertise.",
    highlightedHeading: "Shared Responsibility.",
    description:
      "Across government affairs, intellectual property, membership, technical development and digital engagement, IFMA's committees bring focused expertise to the issues that matter to the industry.",
    committees: [
      {
        committeeName: "Government Affairs Committee",
        headName: "Gaurav Dhawan",
        headCompany: "Orient Electrics",
        image: "",
        sortOrder: 1,
        teamMembers: [
          "Ravindra Singh Negi (Orient Electric Ltd.)",
          "Ravinder Gambhir (Havell's India Ltd.)",
        ],
      },
      {
        committeeName: "IPR Head",
        headName: "Amit Sindhwani",
        headCompany: "Usha International Ltd.",
        image: "",
        sortOrder: 2,
        teamMembers: [],
      },
      {
        committeeName: "Membership Engagement Committee",
        headName: "Hardeep Singh",
        headCompany: "Special Invitee",
        image: "",
        sortOrder: 3,
        teamMembers: [
          "Vivek Abrol (R R Kabel)",
          "Ravinder Gambhir (Havell's India Ltd.)",
        ],
      },
      {
        committeeName: "Technical Committee",
        headName: "Ravinder Gambhir",
        headCompany: "Havells India Ltd.",
        image: "",
        sortOrder: 4,
        teamMembers: [
          "Shailendra Singh (Havells India Ltd.)",
          "Pravin Garje (Crompton Greaves Consumer Electricals Ltd.)",
          "Tanjit Singh Bedi (Usha International Ltd.)",
          "Rajat Srivastava (Usha International Ltd.)",
        ],
      },
    ],
  },
  ctaSection: {
    eyebrow: "Get Involved",
    title: "Want to Contribute",
    highlightedTitle: "to the Industry?",
    description:
      "Explore membership and become part of the collective community shaping the future of India's fan industry.",
    primaryButtonText: "Become a Member",
    primaryButtonUrl: "https://indianfanassociation.com/become-a-member/",
    secondaryButtonText: "Explore Members",
    secondaryButtonUrl: "https://indianfanassociation.com/primary-members-list/",
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
