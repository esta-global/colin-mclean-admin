import * as Yup from "yup";

export interface ExecutiveCouncilMember {
  name: string;
  designation: string;
  company: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ExecutiveCouncilPageValues {
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
  councilSection: {
    heading: string;
    highlightedHeading: string;
    description: string;
    members: ExecutiveCouncilMember[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyExecutiveCouncilMember = (): ExecutiveCouncilMember => ({
  name: "",
  designation: "",
  company: "",
  image: "",
  sortOrder: 0,
  isActive: true,
});

export const executiveCouncilPageSchema = Yup.object({
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
  councilSection: Yup.object({
    heading: stringField(),
    highlightedHeading: stringField(),
    description: stringField(),
    members: Yup.array().of(
      Yup.object({
        name: stringField(),
        designation: stringField(),
        company: stringField(),
        image: stringField(),
        sortOrder: Yup.number().min(0),
        isActive: Yup.boolean(),
      }),
    ),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const executiveCouncilPageInitialValues: ExecutiveCouncilPageValues = {
  bannerSection: {
    title: "Executive",
    highlightedTitle: "Council",
    image: "",
  },
  introSection: {
    eyebrow: "The Leadership Behind IFMA",
    title: "Experience. Expertise.",
    highlightedTitle: "Collective Decision-Making.",
    text:
      "The leaders of IFMA derive their strength from the experienced array of senior executives representing their member companies. Each one in the EC has speciality of experience which ensures that decision making has amalgamation of various considerations well debated before decisions.",
    paragraphs: [
      "The leaders of IFMA derive their strength from the experienced array of senior executives representing their member companies.",
      "Each member of the Executive Council brings a distinct speciality of experience, which ensures that decision-making carries an amalgamation of various considerations, well debated before decisions are taken.",
    ],
    highlightText: "We are indeed proud of the EC team.",
  },
  councilSection: {
    heading: "Executive",
    highlightedHeading: "Council",
    description:
      "Senior industry leaders bringing diverse experience, perspectives and expertise to IFMA's decision-making.",
    members: [
      { name: "Manoj Meena", designation: "Director & CEO", company: "Atomberg Technologies Pvt Ltd.", image: "", sortOrder: 1, isActive: true },
      { name: "Sibabrata Das", designation: "Director & COO", company: "Atomberg Technologies Pvt Ltd.", image: "", sortOrder: 2, isActive: true },
      { name: "Piyush Sethia", designation: "Marketing Head", company: "Atomberg Technologies Pvt Ltd.", image: "", sortOrder: 3, isActive: true },
      { name: "Vishal Chadha", designation: "COO", company: "Bajaj Electricals Ltd.", image: "", sortOrder: 4, isActive: true },
      { name: "Mankesh Patkar", designation: "VP & Country Head CP", company: "Bajaj Electricals Ltd.", image: "", sortOrder: 5, isActive: true },
      { name: "Rajat Chopra", designation: "Business Unit Head - Home Electricals & Pumps", company: "Crompton Greaves Consumer Electricals Ltd.", image: "", sortOrder: 6, isActive: true },
      { name: "Anuj Arora", designation: "PL Head Fans", company: "Crompton Greaves Consumer Electricals Ltd.", image: "", sortOrder: 7, isActive: true },
      { name: "Suchit Naik", designation: "GM Design - Fans", company: "Crompton Greaves Consumer Electricals Ltd.", image: "", sortOrder: 8, isActive: true },
      { name: "Uma Lanka", designation: "ESG and Regulation head Crompton", company: "Crompton Greaves Consumer Electricals Ltd.", image: "", sortOrder: 9, isActive: true },
      { name: "Ameet Gupta", designation: "Director", company: "Havell's India Ltd.", image: "", sortOrder: 10, isActive: true },
      { name: "Deepak Bansal", designation: "SBU Head and EVP", company: "Havells ECD", image: "", sortOrder: 11, isActive: true },
      { name: "Ravinder Gambhir", designation: "Vice President", company: "Havells India Ltd.", image: "", sortOrder: 12, isActive: true },
      { name: "Kulbhushan Bharadwaj", designation: "Fan Business Unit Head", company: "Havell's India Ltd.", image: "", sortOrder: 13, isActive: true },
      { name: "Jothish Kumar V", designation: "Managing Director", company: "Luker Electric Technologies", image: "", sortOrder: 14, isActive: true },
      { name: "E.Sivaramakrishnan", designation: "Director", company: "Luker Electric Technologies", image: "", sortOrder: 15, isActive: true },
      { name: "Ravindra Singh Negi", designation: "CEO & MD", company: "Orient Electric Ltd.", image: "", sortOrder: 16, isActive: true },
      { name: "Gaurav Dhawan", designation: "BU Head-ECD", company: "Orient Electric Ltd.", image: "", sortOrder: 17, isActive: true },
      { name: "Pradeep Dutta", designation: "Head Marketing", company: "Panasonic Life Solutions India Pvt. Ltd.", image: "", sortOrder: 18, isActive: true },
      { name: "Saurabh Porwal", designation: "National Sales Head", company: "Panasonic Life Solutions India Pvt. Ltd.", image: "", sortOrder: 19, isActive: true },
      { name: "Bharat Jaishanghani", designation: "Director", company: "Polycab India Ltd.", image: "", sortOrder: 20, isActive: true },
      { name: "Rohit Dube", designation: "VP (Marketing- FMEG)", company: "Polycab India Ltd.", image: "", sortOrder: 21, isActive: true },
      { name: "Sajal Majilya", designation: "DGM", company: "Polycab India Ltd.", image: "", sortOrder: 22, isActive: true },
      { name: "Vivek CM", designation: "NSM", company: "RR Kable Ltd.", image: "", sortOrder: 23, isActive: true },
      { name: "Raju Bista", designation: "Managing Director", company: "Surya Roshni Ltd.", image: "", sortOrder: 24, isActive: true },
      { name: "Manoj Khattar", designation: "Whole Time Director", company: "Usha International Ltd.", image: "", sortOrder: 25, isActive: true },
      { name: "Bipin Mamgain", designation: "National Sales Head (CD-Division)", company: "Surya Roshni Limited", image: "", sortOrder: 26, isActive: true },
      { name: "Abie Abraham", designation: "Vice President - Electromechanical Division & COO VGIL", company: "V Guard Industries Ltd.", image: "", sortOrder: 27, isActive: true },
      { name: "Akhil Jain", designation: "Executive Director", company: "Lazer India Pvt. Ltd.", image: "", sortOrder: 28, isActive: true },
      { name: "Kanishk Goyal", designation: "Managing Director", company: "Polar Electric Ltd.", image: "", sortOrder: 29, isActive: true },
      { name: "Ganapathy Shankar", designation: "Consultant Sales", company: "Polar Electric Ltd.", image: "", sortOrder: 30, isActive: true },
      { name: "Amit Sindhwani", designation: "IPR Head", company: "Usha International Ltd", image: "", sortOrder: 31, isActive: true },
      { name: "Hardeep Singh", designation: "Special Invitee", company: "", image: "", sortOrder: 32, isActive: true },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
