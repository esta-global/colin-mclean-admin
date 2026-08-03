import * as Yup from "yup";

export type MemberListKind = "primary" | "associate";
export type AssociateMemberCategory = "Finished Goods" | "Component Manufacturer" | "Non Manufacturing Brand Owners";

export interface MemberItem {
  logo: string;
  name: string;
  category: AssociateMemberCategory | "";
  contactPerson: string;
  designation: string;
  addressLines: string[];
  phones: string[];
  email: string;
  website: string;
  sortOrder: number;
  status: boolean;
}

export interface MemberListPageValues {
  primaryBannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  associateBannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  primaryMembersSection: {
    heading: string;
    members: MemberItem[];
  };
  associateMembersSection: {
    heading: string;
    members: MemberItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyMember = (sortOrder = 0): MemberItem => ({
  logo: "",
  name: "",
  category: "Finished Goods",
  contactPerson: "",
  designation: "",
  addressLines: [],
  phones: [],
  email: "",
  website: "",
  sortOrder,
  status: true,
});

const primaryMembers: MemberItem[] = [
  {
    ...createEmptyMember(1),
    name: "Atomberg Technologies Pvt Ltd",
    addressLines: ["Office Nos 1205 Building No A1", "Rupa Solitaire Sector 1", "MBP Mahape Navi Mumbai", "Navi Mumbai - 400710", "Maharashtra"],
    website: "www.atomberg.com",
  },
  {
    ...createEmptyMember(2),
    name: "Bajaj Electricals Ltd",
    addressLines: ["701 (7th floor), Rustomjee Aspiree,", "Bhanu Shankar Yagnik Marg, Off Eastern", "Express Highway, Sion- East,", "Mumbai - 400 022", "Maharashtra"],
    phones: ["022-6218 2300"],
    website: "www.bajajelectricals.com",
  },
  {
    ...createEmptyMember(3),
    name: "Crompton Greaves Consumer Electricals Ltd",
    addressLines: ["Equinox Business Park,", "1st Floor, Tower 3,", "LBS Marg, Kurla (W),", "Mumbai 400070,", "Maharashtra, India"],
    phones: ["+91 22 61678499"],
    website: "www.crompton.co.in",
  },
  {
    ...createEmptyMember(4),
    name: "Havell's India Ltd",
    addressLines: ["QRG Towers", "2D, Sec- 126, Expressway", "Noida 201 304", "Uttar Pradesh"],
    phones: ["0120 -3331000", "0120-3332000/3332300"],
    website: "www.havells.com",
  },
  {
    ...createEmptyMember(5),
    name: "Lazer India Pvt Ltd",
    addressLines: ["43, Rajasthani Udyog Nagar,", "New Delhi - 110033"],
    phones: ["011-43970000"],
    email: "mail@lazerindia.com",
    website: "www.lazerindia.com",
  },
  {
    ...createEmptyMember(6),
    name: "Luker Electric Technologies Pvt. Ltd.",
    addressLines: ["2nd Floor, Jain Tower, NH-17 Bypass, Opp. Lulu Mall, Edappally, Kochi-682 024"],
    phones: ["+918129511766", "+91 81299 51122", "+91 9895011400"],
    website: "www.lukerindia.com",
  },
  {
    ...createEmptyMember(7),
    name: "Orient Electric Ltd.",
    addressLines: ["82, Okhla Industrial Estate", "Phase III , Near Modifloor Mill", "New Delhi - 110 020"],
    phones: ["0120-4147414", "2580470 / 471", "0120-4147426"],
    website: "www.orientfansindia.com",
  },
  {
    ...createEmptyMember(8),
    name: "Polar Electric Ltd.",
    addressLines: ["Akash Building", "23, Circus Avenue", "Unit 8B & 8C, 8th Floor", "Kolkata 700 017", "West Bengal"],
    phones: ["033-66291892", "033-66291842"],
    website: "www.polar-india.com",
  },
  {
    ...createEmptyMember(9),
    name: "Polycab India Ltd",
    addressLines: ["771 Pandit Satwalekar Marg", "Mugal Lane, Mahim", "Mumbai - 400016", "Maharashtra"],
    phones: ["022-67351400"],
    website: "www.polycab.com",
  },
  {
    ...createEmptyMember(10),
    name: "Panasonic Life Solutions India Pvt Ltd",
    addressLines: ["B-Wing, 3rd Floor", "I-Think Techno Campus", "Pokharan Road No. 2", "Thane (West) 400 607", "Maharashtra"],
    phones: ["022-3041888"],
    website: "www.anchor-world.com",
  },
  {
    ...createEmptyMember(11),
    name: "RR Kabel Ltd.",
    addressLines: ["Ram Ratna House, Utopia City, P. B. Marg, Worli,Mumbai - 400 013, Maharashtra"],
    phones: ["022 - 2494 9009 /2492 4144"],
    website: "www.rrkabel.com",
  },
  {
    ...createEmptyMember(12),
    name: "Surya Roshni Limited",
    addressLines: ["Padma Tower-1", "Rajendra Place", "New Delhi - 110 008"],
    phones: ["011-25810093-96", "47108000", "011-25789560"],
    website: "www.surya.co.in",
  },
  {
    ...createEmptyMember(13),
    name: "Usha International Ltd",
    addressLines: ["Plot No. 15", "Institutional Area, Sector - 32", "Gurgaon - 122 001", "Haryana"],
    phones: ["0124-4583320", "4583200", "0124-4583100"],
    website: "www.ushainternational.com",
  },
  {
    ...createEmptyMember(14),
    name: "V-Guard Industries Ltd.",
    addressLines: ["Regd. office: 42/962", "Vennala High School Road", "Vennala, Kochi - 682 028"],
    email: "mail@vguard.com",
    phones: ["91484 433500/200 5000"],
    website: "www.vguard.in",
  },
];

const associateMembers: MemberItem[] = [
  {
    ...createEmptyMember(1),
    name: "FANZART LLP",
    category: "Finished Goods",
    contactPerson: "Anil Lala",
    designation: "CEO",
    phones: ["9886141000"],
    email: "alala@fanzartfans.com",
  },
  {
    ...createEmptyMember(2),
    name: "GM ELEKTRA PVT LTD",
    category: "Component Manufacturer",
    contactPerson: "Satish Kumar",
    designation: "Business Head - Fan",
    phones: ["9920883222"],
    email: "satish.kumar@gmelektra.com",
  },
  {
    ...createEmptyMember(3),
    name: "GOLDMEDAL ELECTRICALS PVT LTD",
    category: "Non Manufacturing Brand Owners",
    contactPerson: "Bishan Jugraj Jain",
    designation: "Director",
    phones: ["9820745251"],
    email: "bishan@goldmedalindia.com",
  },
];

export const memberListPageSchema = Yup.object({
  primaryBannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  associateBannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  primaryMembersSection: Yup.object({
    heading: stringField(),
    members: Yup.array(),
  }),
  associateMembersSection: Yup.object({
    heading: stringField(),
    members: Yup.array(),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const memberListPageInitialValues: MemberListPageValues = {
  primaryBannerSection: {
    title: "Primary",
    highlightedTitle: "Members List",
    image: "",
  },
  associateBannerSection: {
    title: "Associate",
    highlightedTitle: "Members List",
    image: "",
  },
  primaryMembersSection: {
    heading: "List of Primary Members",
    members: primaryMembers,
  },
  associateMembersSection: {
    heading: "List of Associate Members",
    members: associateMembers,
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
