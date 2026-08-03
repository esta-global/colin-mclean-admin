import * as Yup from "yup";

export interface ExecutiveCouncilMember {
  name: string;
  designation: string;
  company: string;
  image: string;
}

export interface ExecutiveCouncilPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  introSection: {
    text: string;
    highlightText: string;
  };
  councilSection: {
    heading: string;
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
});

export const executiveCouncilPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  introSection: Yup.object({
    text: stringField(),
    highlightText: stringField(),
  }),
  councilSection: Yup.object({
    heading: stringField(),
    members: Yup.array().of(
      Yup.object({
        name: stringField(),
        designation: stringField(),
        company: stringField(),
        image: stringField(),
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
    text:
      "The leaders of IFMA derive their strength from the experienced array of senior executives representing their member companies. Each one in the EC has speciality of experience which ensures that decision making has amalgamation of various considerations well debated before decisions.",
    highlightText: "We are indeed proud of the EC team.",
  },
  councilSection: {
    heading: "Executive Council",
    members: [
      { name: "Manoj Meena", designation: "Director & CEO", company: "Atomberg Technologies Pvt Ltd.", image: "" },
      { name: "Sibabrata Das", designation: "Director & COO", company: "Atomberg Technologies Pvt Ltd.", image: "" },
      { name: "Piyush Sethia", designation: "Marketing Head", company: "Atomberg Technologies Pvt Ltd.", image: "" },
      { name: "Vishal Chadha", designation: "COO", company: "Bajaj Electricals Ltd.", image: "" },
      { name: "Mankesh Patkar", designation: "VP & Country Head CP", company: "Bajaj Electricals Ltd.", image: "" },
      { name: "Rajat Chopra", designation: "Business Unit Head - Home Electricals & Pumps", company: "Crompton Greaves Consumer Electricals Ltd.", image: "" },
      { name: "Anuj Arora", designation: "PL Head Fans", company: "Crompton Greaves Consumer Electricals Ltd.", image: "" },
      { name: "Suchit Naik", designation: "GM Design - Fans", company: "Crompton Greaves Consumer Electricals Ltd.", image: "" },
      { name: "Uma Lanka", designation: "ESG and Regulation head Crompton", company: "Crompton Greaves Consumer Electricals Ltd.", image: "" },
      { name: "Ameet Gupta", designation: "Director", company: "Havell's India Ltd.", image: "" },
      { name: "Deepak Bansal", designation: "SBU Head and EVP", company: "Havells ECD", image: "" },
      { name: "Ravinder Gambhir", designation: "Vice President", company: "Havells India Ltd.", image: "" },
      { name: "Kulbhushan Bharadwaj", designation: "Fan Business Unit Head", company: "Havell's India Ltd.", image: "" },
      { name: "Jothish Kumar V", designation: "Managing Director", company: "Luker Electric Technologies", image: "" },
      { name: "E.Sivaramakrishnan", designation: "Director", company: "Luker Electric Technologies", image: "" },
      { name: "Ravindra Singh Negi", designation: "CEO & MD", company: "Orient Electric Ltd.", image: "" },
      { name: "Gaurav Dhawan", designation: "BU Head-ECD", company: "Orient Electric Ltd.", image: "" },
      { name: "Pradeep Dutta", designation: "Head Marketing", company: "Panasonic Life Solutions India Pvt. Ltd.", image: "" },
      { name: "Saurabh Porwal", designation: "National Sales Head", company: "Panasonic Life Solutions India Pvt. Ltd.", image: "" },
      { name: "Bharat Jaishanghani", designation: "Director", company: "Polycab India Ltd.", image: "" },
      { name: "Rohit Dube", designation: "VP (Marketing- FMEG)", company: "Polycab India Ltd.", image: "" },
      { name: "Sajal Majilya", designation: "DGM", company: "Polycab India Ltd.", image: "" },
      { name: "Vivek CM", designation: "NSM", company: "RR Kable Ltd.", image: "" },
      { name: "Raju Bista", designation: "Managing Director", company: "Surya Roshni Ltd.", image: "" },
      { name: "Manoj Khattar", designation: "Whole Time Director", company: "Usha International Ltd.", image: "" },
      { name: "Bipin Mamgain", designation: "National Sales Head (CD-Division)", company: "Surya Roshni Limited", image: "" },
      { name: "Abie Abraham", designation: "Vice President - Electromechanical Division & COO VGIL", company: "V Guard Industries Ltd.", image: "" },
      { name: "Akhil Jain", designation: "Executive Director", company: "Lazer India Pvt. Ltd.", image: "" },
      { name: "Kanishk Goyal", designation: "Managing Director", company: "Polar Electric Ltd.", image: "" },
      { name: "Ganapathy Shankar", designation: "Consultant Sales", company: "Polar Electric Ltd.", image: "" },
      { name: "Amit Sindhwani", designation: "IPR Head", company: "Usha International Ltd", image: "" },
      { name: "Hardeep Singh", designation: "Special Invitee", company: "", image: "" },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
