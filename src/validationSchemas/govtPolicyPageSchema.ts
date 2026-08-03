import * as Yup from 'yup';

export interface GovtEngagementPoint {
  text: string;
}

export interface GovtEngagementLeftCard {
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

export interface GovtEngagementRightCard {
  title: string;
  points: GovtEngagementPoint[];
}

export interface GovtEngagementSideIssue {
  title: string;
  points: GovtEngagementPoint[];
}

export interface GovtEngagementButton {
  title: string;
  subtitle: string;
  url: string;
}

export interface GovtEngagementTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface GovtEngagementCard {
  title: string;
  description: string;
  points: string[];
}

export interface GovtEngagementSection {
  id: string;
  title: string;
  description: string;
  buttons: GovtEngagementButton[];
  cards: GovtEngagementCard[];
  table: GovtEngagementTable;
}

export interface GovtPolicyPageValues {
  name: string;
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  detailsSection: {
    heading: string;
    paragraphs: string[];
    introParagraphs: string[];
    bulletHeading: string;
    bullets: string[];
    bottomParagraphs: {
      text: string;
      isItalic: boolean;
    }[];
    cta: {
      label: string;
      url: string;
    };
  };
  hero?: {
    title: string;
    highlightedTitle: string;
    bannerImage: {
      url: string;
      alt: string;
    };
  };
  introduction?: {
    leftCard: GovtEngagementLeftCard;
    rightCard: GovtEngagementRightCard;
  };
  issues?: {
    supplySide: GovtEngagementSideIssue;
    demandSide: GovtEngagementSideIssue;
  };
  sections?: GovtEngagementSection[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const govtPolicyPageSchema = Yup.object({
  name: stringField(),
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  detailsSection: Yup.object({
    heading: stringField(),
    paragraphs: Yup.array().of(stringField()),
    introParagraphs: Yup.array().of(stringField()),
    bulletHeading: stringField(),
    bullets: Yup.array().of(stringField()),
    bottomParagraphs: Yup.array().of(
      Yup.object({
        text: stringField(),
        isItalic: Yup.boolean(),
      }),
    ),
    cta: Yup.object({
      label: stringField(),
      url: stringField(),
    }),
  }),
  hero: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    bannerImage: Yup.object({
      url: stringField(),
      alt: stringField(),
    }),
  }).optional(),
  introduction: Yup.object({
    leftCard: Yup.object({
      title: stringField(),
      description: stringField(),
      linkText: stringField(),
      linkUrl: stringField(),
    }),
    rightCard: Yup.object({
      title: stringField(),
      points: Yup.array().of(
        Yup.object({
          text: stringField(),
        }),
      ),
    }),
  }).optional(),
  issues: Yup.object({
    supplySide: Yup.object({
      title: stringField(),
      points: Yup.array().of(Yup.object({ text: stringField() })),
    }),
    demandSide: Yup.object({
      title: stringField(),
      points: Yup.array().of(Yup.object({ text: stringField() })),
    }),
  }).optional(),
  sections: Yup.array().of(
    Yup.object({
      id: stringField(),
      title: stringField(),
      description: stringField(),
      buttons: Yup.array().of(
        Yup.object({
          title: stringField(),
          subtitle: stringField(),
          url: stringField(),
        }),
      ),
      cards: Yup.array().of(
        Yup.object({
          title: stringField(),
          description: stringField(),
          points: Yup.array().of(stringField()),
        }),
      ),
      table: Yup.object({
        title: stringField(),
        headers: Yup.array().of(stringField()),
        rows: Yup.array().of(Yup.array().of(stringField())),
      }),
    }),
  ).optional(),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const govtPolicyPages = [
  { slug: "bis-specifications", label: "BIS Specifications" },
  { slug: "quality-control-order", label: "Quality Control Order" },
  { slug: "bee-star-rating", label: "BEE Star Rating" },
  { slug: "energy-conservation", label: "Energy Conservation" },
  { slug: "govt-engagements", label: "Government Engagements" },
];

const beeStarRatingContent = {
  introParagraphs: [
    "Setup on 1st March 2002 under the provisions of the Energy Conservation Act, 2001, the Bureau of Energy Efficiency (BEE) has the primary objective of reducing the energy intensity of the Indian economy and assist in developing policies and strategies with a thrust on self-regulation and market principles.",
  ],
  bulletHeading: "BEE performs regulatory and promotional functions including:",
  bullets: [
    "Create awareness and disseminate information on energy efficiency and conservation,",
    "Promote research and development,",
    "Develop testing and certification procedures and promote testing facilities",
    "Promote the use of energy-efficient processes, equipment, devices, and systems",
  ],
  bottomParagraphs: [
    {
      text: "Recognizing that Energy 'labeling' is one of the most cost-effective policy tools for improving energy efficiency and lowering energy cost of appliances/equipment for the consumers BEE has started the star labeling program.",
      isItalic: false,
    },
    {
      text: "The BEE star labels, now mandatory for several products including fans, show how much electricity the appliance consumes in a year. Each appliance gets between one and five stars, with five stars meaning that the product is extremely efficient and is likely to keep electricity bills in check.",
      isItalic: true,
    },
    {
      text: "For fans, Indian Standard IS 374:2019 (Specifications for Electric Ceiling Type Fans) is applicable and is covered under the BEE Star Labelling program.",
      isItalic: false,
    },
  ],
  ctaLabel: "Read more on this BEE link",
};

export const createGovtEngagementDefaultValues = (): Partial<GovtPolicyPageValues> => ({
  hero: {
    title: "Government",
    highlightedTitle: "Engagements",
    bannerImage: {
      url: "",
      alt: "Government Engagements Banner",
    },
  },
  introduction: {
    leftCard: {
      title: "Standard Revision Alignment",
      description: "Essential technical parameters in standard need to be revised considering energy performing ceiling fan standard. IFMA members are aligned to focus on the standard revise requirements.",
      linkText: "Revised Indian standard IS 374: 2019",
      linkUrl: "#",
    },
    rightCard: {
      title: "Enforcement of Standardization Requirements",
      points: [
        { text: "Voluntary compliance by all manufacturer w.e.f Dec 2019" },
        { text: "Mandatory compliance w.e.f 1st Jan 2020 by BIS" },
        { text: "Extension granted 6 month" },
        { text: "Implementation date: Oct 2020" },
        { text: "Revised implementation date: 01.01.2021" },
      ],
    },
  },
  issues: {
    supplySide: {
      title: "Supply Side Issues",
      points: [
        { text: "Extension of timeline - 01.01.2021" },
        { text: "Testing Essential for Product - Orders" },
        { text: "Supply Chain Disruptions" },
        { text: "Substandard imports / Counterfeit products" },
        { text: "Effective implementation across retail touch points" },
        { text: "Audit - Non standards sales and rogue sellers" },
      ],
    },
    demandSide: {
      title: "Demand Risk Issues",
      points: [
        { text: "Non availability of lab capacity" },
        { text: "Interoperability requirements - Components" },
        { text: "Current Standards vs Best Practices" },
        { text: "Uniformity of implementation & enforcement" },
        { text: "Risk assessment of System Level Standards & Cyber Security" },
      ],
    },
  },
  sections: [
    {
      id: "inclusion-proposals",
      title: "Inclusion of all sweeps for ceiling fan, Air delivery and service value proposals",
      description: "Due to high frequency application of induction motors and BLDC motors, IFMA members proposed essential performance attributes and timelines.",
      buttons: [
        {
          title: "CONSIDERATION OF ALLOWING FOR THE EXISTING BATCHES",
          subtitle: "The batch manufactured before 01.01.2021 should be allowed to be sold in market up to 30.06.2021.",
          url: "",
        },
        {
          title: "CONSIDERATION OF FOLLOWING ATTRIBUTE - FANS CLASSIFICATION (TABLE 1)",
          subtitle: "Consideration of total airflow and noise parameters to be included in the revised standard.",
          url: "",
        },
      ],
      cards: [],
      table: {
        title: "TABLE 1: REVISED ATTRIBUTES FOR CEILING FAN PERFORMANCE (PROPOSED BY IFMA)",
        headers: ["S.No", "Fan Type/Size", "Air Delivery (m3/min)", "Performance"],
        rows: [
          ["1", "600", "70", "3.2"],
          ["2", "750", "110", "3.5"],
          ["3", "900", "130", "3.8"],
          ["4", "1050", "170", "4.0"],
          ["5", "1200", "215", "4.0"],
          ["6", "1400", "270", "4.1"],
          ["7", "1500", "300", "4.1"],
        ],
      },
    },
    {
      id: "regulating-imports",
      title: "Regulating imports from China, MSM scale / Fiscal attractions, WCO evaluation",
      description: "IFMA has been engaging with Indian Government for Quality Control Order (QCO) for Fans to regulate the import of low quality & substandard fans into the country.\nPresently, IFMA is advocating with BIS to formulate Indian Standard for Fan Components (Motors, Blades, Downrods, Bearings etc) which will assist in restricting cheap quality sub-assemblies imports into India & boost domestic component manufacturing ecosystem.\nAdvocating for lower duties on imports of critical raw materials (e.g. electrical steel, rare earth magnets) used in BLDC motor technology to promote local manufacturing.\nIFMA has requested Ministry of Heavy Industries / DPIIT to include ceiling fans under PLI Scheme or state incentive scheme for component manufacturing to boost domestic manufacturing.",
      buttons: [],
      cards: [],
      table: { title: "", headers: [], rows: [] },
    },
    {
      id: "gst-relaxation",
      title: "Relaxation of GST Rates for Electrical Fans for B2C – DPIIT, GST Council",
      description: "IFMA representation to Ministry of Finance / GST Council regarding GST rationalization for ceiling fans.",
      buttons: [],
      cards: [
        { title: "Fast Track Approvals", description: "Accelerated testing and certification for compliant manufacturers.", points: ["Quick turn-around time", "Priority processing"] },
        { title: "Essential Declarations", description: "Clear guidelines on product ratings and energy efficiency declarations.", points: ["Standardized labels", "Consumer transparency"] },
        { title: "Capacity Building", description: "Support for domestic testing laboratories and technical infrastructure.", points: ["Lab upgrades", "Skill development"] },
        { title: "Market Surveillance & Enforcement", description: "Joint audit drives with authorities to curb non-compliant sales.", points: ["Random sampling", "Penalty enforcement"] },
        { title: "Appeal and Grievance", description: "Institutional redressal mechanism for industry grievances.", points: ["Nodal office", "Fast resolution"] },
      ],
      table: { title: "", headers: [], rows: [] },
    },
    {
      id: "pre-budget-memorandum",
      title: "IFMA Pre-Budget Memorandum 2021-22",
      description: "Under the pre-budget memorandum 2021-22, IFMA submitted key recommendations to the Government.",
      buttons: [],
      cards: [],
      table: {
        title: "KEY RECOMMENDATIONS PRE-BUDGET 2021-22",
        headers: ["Category", "Recommendation", "Rationale"],
        rows: [
          ["GST on Fans", "Lowering of GST on Ceiling Fans to 12%", "Fans are an essential household item across socio-economic strata. Lowering GST will make energy efficient fans affordable."],
          ["Customs Duty", "Correction of Inverted Duty Structure on Fan Raw Materials", "Import duty on key raw materials like electrical steel & magnets is higher than finished component import."],
          ["Raw Material Availability", "Ensuring Adequate Supply of Cold Rolled Non-Grain Oriented (CRNGO) Steel", "Domestic availability of high-grade electrical steel is critical for manufacturing high-efficiency ceiling fan motors."],
        ],
      },
    },
  ],
  seo: {
    metaTitle: "Government Engagements | IFMA",
    metaDescription: "IFMA government engagements, policy advocacy, QCO, BIS standards, and pre-budget recommendations for ceiling fan industry.",
    keywords: ["Government Engagements", "IFMA", "BIS Standard", "QCO Fans", "BEE Star Rating"],
  },
});

export const createGovtPolicyPageInitialValues = (
  name = "BIS Specifications",
  slug = "bis-specifications",
): GovtPolicyPageValues => {
  const baseValues: GovtPolicyPageValues = {
    name,
    bannerSection: {
      title: name.split(" ")[0] || name,
      highlightedTitle: name.split(" ").slice(1).join(" "),
      image: "",
    },
    detailsSection: {
      heading: name,
      paragraphs: [],
      introParagraphs:
        slug === "bee-star-rating"
          ? beeStarRatingContent.introParagraphs
          : [
              "The journey of setting up the Standards was initiated in post-independence by setting up of an organization called the Indian Standards Institution (ISI) which concentrated on standardization activity.",
            ],
      bulletHeading: slug === "bee-star-rating" ? beeStarRatingContent.bulletHeading : "",
      bullets: slug === "bee-star-rating" ? beeStarRatingContent.bullets : [],
      bottomParagraphs: slug === "bee-star-rating" ? beeStarRatingContent.bottomParagraphs : [],
      cta: {
        label: slug === "bee-star-rating" ? beeStarRatingContent.ctaLabel : "Read more on this BIS link",
        url: "",
      },
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  };

  if (slug === "govt-engagements") {
    const defaultEngagements = createGovtEngagementDefaultValues();
    return {
      ...baseValues,
      ...defaultEngagements,
    };
  }

  return baseValues;
};
