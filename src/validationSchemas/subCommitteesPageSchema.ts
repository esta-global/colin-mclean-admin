import * as Yup from "yup";

export interface SubCommittee {
  committeeName: string;
  headName: string;
  headCompany: string;
  image: string;
  teamMembers: string[];
}

export interface SubCommitteesPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  introSection: {
    text: string;
    highlightText: string;
  };
  committeesSection: {
    heading: string;
    committees: SubCommittee[];
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
});

export const subCommitteesPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  introSection: Yup.object({
    text: stringField(),
    highlightText: stringField(),
  }),
  committeesSection: Yup.object({
    heading: stringField(),
    committees: Yup.array().of(
      Yup.object({
        committeeName: stringField(),
        headName: stringField(),
        headCompany: stringField(),
        image: stringField(),
        teamMembers: Yup.array().of(stringField()),
      }),
    ),
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
    text:
      "To enable specific focus to be provided to few important subjects, IFMA has constituted Sub-Committees headed by experts in that field. The Team Heads are ably supported by members of same discipline expertise as required.",
    highlightText: "We are proud of the contribution of each one of them.",
  },
  committeesSection: {
    heading: "Sub Committees",
    committees: [
      {
        committeeName: "Government Affairs Committee",
        headName: "Gaurav Dhawan",
        headCompany: "Orient Electrics",
        image: "",
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
        teamMembers: [],
      },
      {
        committeeName: "Membership Engagement Committee",
        headName: "Hardeep Singh",
        headCompany: "Special Invitee",
        image: "",
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
        teamMembers: [
          "Shailendra Singh (Havells India Ltd.)",
          "Pravin Garje (Crompton Greaves Consumer Electricals Ltd.)",
          "Tanjit Singh Bedi (Usha International Ltd.)",
          "Rajat Srivastava (Usha International Ltd.)",
        ],
      },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
