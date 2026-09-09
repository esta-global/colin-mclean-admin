import * as Yup from "yup";

export interface GovtEngagementPoint {
  label?: string;
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
  note?: string;
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

export interface GovtEngagementParagraph {
  text: string;
  style: "normal" | "highlighted";
}

export interface AtmanirbharSection {
  id: string;
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  paragraphs: GovtEngagementParagraph[];
  highlightedParagraph: string;
  stats: { value: string; label: string }[];
  cards: { title: string; description: string }[];
}

export interface BisBeeTable {
  type: string;
  title: string;
  subtitle: string;
  footerText: string;
  headers: string[];
  rows: string[][];
}

export interface BisBeeMarking {
  label: string;
  image: string;
  caption: string;
}

export interface BisBeeLink {
  title: string;
  url: string;
}

export interface BisBeeSection {
  id: string;
  title: string;
  description: string;
  markingsHeading: string;
  footerNote: string;
  tables: BisBeeTable[];
  markings: BisBeeMarking[];
  links: BisBeeLink[];
}

export interface BisBeeContent {
  introHeadingPrimary: string;
  introHeadingHighlight: string;
  introParagraphs: string[];
  sections: BisBeeSection[];
}

export interface GovtEngagementSection {
  id: string;
  eyebrow?: string;
  title: string;
  highlightedTitle?: string;
  description: string;
  pillarsHeading?: string;
  highlightedCallout?: string;
  paragraphs?: GovtEngagementParagraph[];
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
  bisBeeContent?: BisBeeContent;
  hero?: {
    title: string;
    highlightedTitle: string;
    bannerImage: {
      url: string;
      alt: string;
    };
  };
  introduction?: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    body: string;
    concernsHeading: string;
    leftCard?: GovtEngagementLeftCard;
    rightCard?: GovtEngagementRightCard;
  };
  issues?: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    description: string;
    supplySide: GovtEngagementSideIssue;
    demandSide: GovtEngagementSideIssue;
  };
  sections?: GovtEngagementSection[];
  richContent: {
    html: string;
  };
  atmanirbharSections?: AtmanirbharSection[];
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
  bisBeeContent: Yup.object({
    introHeadingPrimary: stringField(),
    introHeadingHighlight: stringField(),
    introParagraphs: Yup.array().of(stringField()),
    sections: Yup.array().of(
      Yup.object({
        id: stringField(),
        eyebrow: stringField(),
        title: stringField(),
        highlightedTitle: stringField(),
        description: stringField(),
        pillarsHeading: stringField(),
        highlightedCallout: stringField(),
        paragraphs: Yup.array().of(
          Yup.object({
            text: stringField(),
            style: Yup.mixed<"normal" | "highlighted">().oneOf([
              "normal",
              "highlighted",
            ]),
          }),
        ),
        markingsHeading: stringField(),
        footerNote: stringField(),
        tables: Yup.array().of(
          Yup.object({
            type: stringField(),
            title: stringField(),
            subtitle: stringField(),
            footerText: stringField(),
            headers: Yup.array().of(stringField()),
            rows: Yup.array().of(Yup.array().of(stringField())),
          }),
        ),
        markings: Yup.array().of(
          Yup.object({
            label: stringField(),
            image: stringField(),
            caption: stringField(),
          }),
        ),
        links: Yup.array().of(
          Yup.object({
            title: stringField(),
            url: stringField(),
          }),
        ),
      }),
    ),
  }).optional(),
  hero: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    bannerImage: Yup.object({
      url: stringField(),
      alt: stringField(),
    }),
  }).optional(),
  introduction: Yup.object({
    eyebrow: stringField(),
    title: stringField(),
    highlightedTitle: stringField(),
    body: stringField(),
    concernsHeading: stringField(),
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
    eyebrow: stringField(),
    title: stringField(),
    highlightedTitle: stringField(),
    description: stringField(),
    supplySide: Yup.object({
      title: stringField(),
      points: Yup.array().of(Yup.object({ text: stringField() })),
    }),
    demandSide: Yup.object({
      title: stringField(),
      points: Yup.array().of(Yup.object({ text: stringField() })),
    }),
  }).optional(),
  sections: Yup.array()
    .of(
      Yup.object({
        id: stringField(),
        title: stringField(),
        description: stringField(),
        buttons: Yup.array().of(
          Yup.object({
            title: stringField(),
            note: stringField(),
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
    )
    .optional(),
  richContent: Yup.object({
    html: stringField(),
  }),
  atmanirbharSections: Yup.array().of(
    Yup.object({
      id: stringField(),
      eyebrow: stringField(),
      title: stringField(),
      highlightedTitle: stringField(),
      paragraphs: Yup.array().of(
        Yup.object({ text: stringField(), style: Yup.mixed<"normal" | "highlighted">().oneOf(["normal", "highlighted"]).required() }),
      ),
      highlightedParagraph: stringField(),
      stats: Yup.array().of(Yup.object({ value: stringField(), label: stringField() })),
      cards: Yup.array().of(Yup.object({ title: stringField(), description: stringField() })),
    }),
  ),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const govtPolicyPages = [
  { slug: "bis-bee", label: "BIS & BEE" },
  { slug: "bis-specifications", label: "BIS Specifications" },
  { slug: "quality-control-order", label: "Quality Control Order" },
  { slug: "bee-star-rating", label: "BEE Star Rating" },
  { slug: "energy-conservation", label: "Energy Conservation" },
  { slug: "atmanirbhar", label: "Atmanirbhar" },
  { slug: "govt-engagements", label: "Government Engagements" },
];

const atmanirbharRichHtml = `
<h2>Self-reliant India</h2>
<h3>An industry made in India</h3>
<p>The Indian fan industry, comprising of several players, has been at the forefront of innovation and adoption of new technology for the greater good of the society. Having one of the highest penetration levels - close to ~80% market penetration, touching the lives of 100 crore citizens of India - fans are a mass market product due to their functionality and benefit against the ever-looming heatwave in India.</p>
<p><strong>Almost 90% of all the fans sold in India are 'Made-in-India'.</strong></p>
<ul>
  <li><strong>~80%</strong> - Market penetration</li>
  <li><strong>100 crore</strong> - Citizens whose lives fans touch</li>
  <li><strong>~100%</strong> - Localised manufacturing capacity for ceiling fans</li>
  <li><strong>~90%</strong> - Of fans sold in India are Made in India</li>
</ul>
<h2>The manufacturing base</h2>
<h3>One of the most highly indigenised industries</h3>
<p>We are proud to state the fact that the electrical fans industry is one of the most highly indigenised industries. We are happy to inform you that the manufacturing capacity in the country today is ~100% localised for ceiling fans. Further, almost 90% of all the fans sold in India are 'Made-in-India'.</p>
<blockquote>The industry ties itself to the Atmanirbhar Bharat Abhiyaan - the Self-reliant India vision of our Hon'ble Prime Minister Shri Narendra Modi.</blockquote>
<p>With further impetus in the form of research and development of a newer form of components for fans that are energy efficient, such as BLDC motors, the aim is to make the industry independent of import of raw material and self-reliant in all senses.</p>
<h2>Atmanirbhar Bharat</h2>
<h3>Touching all the pillars of self-reliance</h3>
<p>The fan industry touches all the pillars of self-reliance, viz.</p>
<ol>
  <li><strong>Economy:</strong> A mass-market product with one of the highest penetration levels in the country, supporting an entire domestic value chain of vendors, distributors and channel partners.</li>
  <li><strong>Infrastructure:</strong> Manufacturing capacity in the country today is ~100% localised for ceiling fans, built on plants and tooling established within India.</li>
  <li><strong>System:</strong> Research and development of newer, energy-efficient components such as BLDC motors is moving the industry to technology-driven production.</li>
  <li><strong>Vibrant demography:</strong> Fans touch the lives of 100 crore citizens of India - a product made by Indians, for Indian homes and workplaces.</li>
  <li><strong>Demand:</strong> Almost 90% of all fans sold in India are Made in India, meeting domestic demand from domestic production rather than imports.</li>
</ol>
<h2>The aim</h2>
<h3>Independent of imported raw material. Self-reliant in all senses.</h3>
<p>Energy-efficient innovation - led by BLDC motors and continued investment in research and development - is what carries the industry there.</p>
`;

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

export const createGovtEngagementDefaultValues =
  (): Partial<GovtPolicyPageValues> => ({
    hero: {
      title: "Government",
      highlightedTitle: "Engagements",
      bannerImage: {
        url: "",
        alt: "Government Engagements Banner",
      },
    },
    introduction: {
      eyebrow: "Policy Advocacy",
      title: "Representing the industry",
      highlightedTitle: "before government",
      body: "While IFMA members are committed towards preserving the environment and promoting energy efficiency and welcome the noble intent of BEE in mandating the star labelling requirements, however in the current COVID-19 situation, industry is reeling under tremendous economic pressure.",
      concernsHeading: "IFMA's concerns raised before BEE included:",
    },
    issues: {
      eyebrow: "Engagement 01 - BEE",
      title: "Deferment of star",
      highlightedTitle: "labelling requirements",
      description:
        "The case placed before the Bureau of Energy Efficiency rested on the pressure being felt on both sides of the market.",
      supplySide: {
        title: "Supply Side Issues",
        points: [
          { label: "Research & Development", text: "stalled" },
          { label: "Testing & approval of new products", text: "stalled" },
          {
            label: "Supply chain & productivity",
            text: "disruption and losses due to the Covid-19 pandemic",
          },
          {
            label: "Workforce",
            text: "uncertainty caused due to the Covid-19 pandemic",
          },
          {
            label: "Unsold inventory",
            text: "piled up stocks due to closure of shops in lockdown",
          },
          {
            label: "Retail",
            text: "restricted due to closure of shops in lockdown",
          },
        ],
      },
      demandSide: {
        title: "Demand Side Issues",
        points: [
          { label: "Total consumer demand", text: "all time low" },
          { label: "Implication for the common man", text: "cost burden" },
          { label: "Economic slowdown", text: "slower recovery" },
          {
            label: "Public health implication",
            text: "heat wave across India",
          },
          {
            label: "Public awareness programme",
            text: "lack of acceptability by consumers",
          },
        ],
      },
    },
    sections: [
      {
        id: "sweeps",
        eyebrow: "Engagement 02 - BEE",
        title: "Inclusion of",
        highlightedTitle: "all sweeps for ceiling fans",
        description:
          "IFMA's proposals on sweep sizes, air delivery and service value. Star Labelling Requirements which become mandatory from 1st January 2022 cover sweep sizes of fans as stated in Indian Standard (IS) 374:2019 - namely 900 mm, 1050 mm, 1200 mm, 1400 mm and 1500 mm. Since there are other sweep sizes prevalent in the market, IFMA has been engaging with BEE for the inclusion of these sweep sizes for effective compliance with the star labelling norms.",
        buttons: [
          {
            title: "Substitute the following for the existing entries",
            subtitle:
              "The recommended standard sizes of ceiling fans shall be 600, 750, 900, 1050, 1200, 1300, 1400 and 1500 mm.",
            url: "",
          },
          {
            title: "Insertion at the end",
            note: "(Page 5, clause 15.1, para 1)",
            subtitle:
              "Before starting the tests, the fan and its attachment are adjusted in accordance with the manufacturer's instructions for normal operation. Any controls shall be set for maximum continuous air flow unless the manufacturer's instruction states otherwise. Any other functions such as luminaries and remote-control mechanism shall be turned off.",
            url: "",
          },
          {
            title: "Substitute the following for the existing entries",
            subtitle: "Performance value of fans (clause 15.1 and 15.2)",
            url: "",
          },
        ],
        cards: [],
        table: {
          title: "Performance value of fans (clause 15.1 and 15.2)",
          headers: [
            "Sl. No.",
            "Fan size (mm)",
            "Air delivery (m3/m/W)",
            "Service value",
          ],
          rows: [
            ["1", "600", "100", "1.5"],
            ["2", "750", "115", "2.1"],
            ["3", "900", "130", "3.1"],
            ["4", "1050", "150", "3.1"],
            ["5", "1200", "210", "4.0"],
            ["6", "1300", "215", "4.0"],
            ["7", "1400", "245", "4.1"],
            ["8", "1500", "270", "4.3"],
          ],
        },
      },
      {
        id: "imports",
        eyebrow: "Engagement 03 - DPIIT",
        title: "Regulating imports, HSN codes and BCD reduction",
        highlightedTitle: "",
        description:
          "IFMA has been engaging with the Department for Promotion of Industry and Internal Trade on regulations on the import of goods from China and its effect on the fan industry.\n\nIFMA highlighted the hardships faced by the industry - research and development, raw material procurement and inventory management of existing products have already slowed down. As per industry estimates, there was a loss of capacity utilisation of 60-70% across all manufacturing facilities due to the above reasons, along with the loss of the peak season.\n\nAny barriers to trade or restriction on any category for imports by the way of a ban or imposition of prohibitory tariffs/duties may be detrimental to both demand and supply.\n\nIFMA and the fan industry support the government's push for 'Make in India' through boosting domestic manufacturing capabilities; imposing high tariffs in the form of BCD hikes to promote domestic capabilities may prove to be counterproductive for the entire existing value chain.\n\nSince Basic Customs Duty was increased in February 2020, which already led to an increase in consumer prices by ~15+%, it was requested to bring back the BCD to previous levels and give the industry time to scale up production.\n\nScaling up operations domestically is an industry-level intention; however, instantaneously curbing imports would lead to domestic demand not being fulfilled for this common man's product. To build the requisite capacity to meet the demand, the industry will require a time frame of at least ~2-3 years to scale up operations with the support of the government on developing a comprehensive ecosystem and the sophistication required for mass-scale, commercially viable production of fans.",
        buttons: [],
        cards: [],
        table: { title: "", headers: [], rows: [] },
      },
      {
        id: "gst",
        eyebrow: "Engagement 04 - CBIC & GST Council",
        title: "Relaxation of GST rates for electrical fans to 5%",
        highlightedTitle: "",
        description:
          "IFMA has been requesting the CBIC and the GST Council for the inclusion of a GST rate reduction on fans - a common-person product - from the current 18% to 5% as an agenda item for discussion in the said GST Council meeting.",
        pillarsHeading: "IFMA's request rests on 5 key pillars:",
        buttons: [],
        cards: [
          {
            title: "Public health standpoint",
            description: "",
            points: [
              "Fans act as an ancillary medical device, playing an important role in mitigating COVID-19 by improving ventilation.",
              "The Ministry of Health and Family Welfare recognises use of air supply fans to help improve thermal comfort and maintain good ventilation.",
              "As per the Centre for Disease Control, US, fans can decrease the risk of Covid-19 transmission indoors.",
            ],
          },
          {
            title: "Demand side challenges",
            description: "",
            points: [
              "The fan industry, as per industry estimates, is facing a demand loss of 35% of annual sales.",
              "With income levels shrinking or reducing to nil in some cases, any support passed on in the form of a GST rate reduction will be a big relief to the consumer.",
            ],
          },
          {
            title: "Supply side challenges",
            description: "",
            points: [
              "The adverse impact of a high GST rate of 18% is impacting the industry and the supply chain - vendors, distributors, channel partners and the end consumer.",
              "Input cost for production of fans has escalated by 15-20% given the impact of the second wave.",
              "A reduction in GST rate can provide a working capital cushion to invest in capacity expansion.",
            ],
          },
          {
            title: "Energy efficiency standpoint",
            description: "",
            points: [
              "The fan industry is working towards effective implementation of BEE Star Labelling Requirements, mandatory from 1st January 2022.",
              "Compliance with energy efficiency norms has a cost implication of ~25-30% on the price of a fan.",
              "A GST reduction provides working capital to invest in capacity expansion and energy-efficient technology.",
              "It can add to government revenue while reducing the overall carbon footprint, as per the Paris Agreement 2015.",
            ],
          },
          {
            title: "Atmanirbhar Bharat",
            description: "",
            points: [
              "The fan industry is one of the most highly indigenised industries, with close to ~80% market penetration, touching the lives of 100 crore citizens of India.",
              "Manufacturing capacity in the country today is ~100% localised for ceiling fans.",
              "Almost 90% of all fans sold in India are Made in India.",
              "A GST rate reduction will boost overall sales and market penetration of fans.",
              "It will promote GST compliance and plug instances of tax evasion, boosting overall revenue collection for the government.",
            ],
          },
        ],
        table: { title: "", headers: [], rows: [] },
      },
      {
        id: "budget",
        eyebrow: "Engagement 05 - Ministry of Finance",
        title: "IFMA Pre-Budget Memorandum 2021-22",
        highlightedTitle: "",
        description:
          "With a hope that the Union Budget would be an occasion to make a re-assessment and give a further booster shot to the economy, IFMA made suggestions to address some immediate challenges at hand - such as GST on fans, reduction in BCD, and incentivising fan manufacturing to stimulate exports.",
        buttons: [],
        cards: [
          {
            title: "GST on fans",
            description: "",
            points: [
              "Recommendation: Lower the GST tax slab for fans to 5%.",
              "Rationale: Fans are an essential commodity of mass importance and are highly penetrated in every household in India and in the commercial sector, hence GST rates for fans should be reduced to 5%. Lowering the GST rate to 5% would immensely help the industry spur demand and provide a working capital cushion for manufacturers to invest in capacity expansion and energy efficiency.",
            ],
          },
          {
            title: "Reduction in BCD",
            description: "",
            points: [
              "Recommendation: Reduce GST on BEE testing services to 5% and bring BCD for table, pedestal, blowers and portable fans back to 10%.",
              "Rationale: BCD was increased in February 2020, leading to an increase in consumer prices by ~15+%. For HSN codes 84145110, 84145130 and 84145190, only about 27% of annual demand is met by domestic production. The industry requires at least ~2-3 years to scale up, and lower duty on parts for induction/BLDC motors and PCBs would reduce input costs.",
            ],
          },
          {
            title: "Incentivise fan manufacturing",
            description: "",
            points: [
              "Recommendation: Introduce incentives and subsidies for energy-efficient products and restore the weighted deduction on R&D expenditure of 200%.",
              "Rationale: Sector-specific incentives and subsidies will help create an ecosystem for competitiveness and scalability. Restoring the earlier 200% weighted deduction on R&D expenditure is critical for the Make in India initiative.",
            ],
          },
        ],
        table: { title: "", headers: [], rows: [] },
      },
      {
        id: "lockdown",
        eyebrow: "Engagement 06 - MHA & State Governments",
        title: "Opening of shops during lockdown",
        highlightedTitle: "",
        description:
          "Fans are widely recognised as a cost-effective way to provide thermal comfort and as such they are a common man's protection against the heatwave, which poses a challenge to public health at large, especially in a tropical country like India.\n\nIFMA urged the Ministry of Home Affairs and various State governments to allow the opening of shops for electrical fans during the lockdown. As government continued to battle and balance health and economic activity, IFMA presented certain innovative solutions for assisting the government and industry to fight the COVID battle, which included:",
        buttons: [],
        cards: [
          {
            title: "Sale across all zones, online and offline",
            description:
              "Fans should be allowed to be sold in green, red and orange districts - without the distinction of essential and non-essential - through both online and offline channels.",
            points: [
              "The SOPs for the opening of establishments are already there for offline shops; e-commerce companies are already observing very stringent health and hygiene measures and this channel must also be leveraged to meet the demands of customers.",
              "Limiting red zones to only essentials, especially through online sales, does not allow the industry to serve the largest demand zones for its products.",
            ],
          },
          {
            title: "Expand the essentials list",
            description:
              "Expand the essentials to include electrical appliances - including the most critical summer product, the electric fan.",
            points: [
              "Since shops of non-essentials cannot open in containment zones, e-commerce companies should be allowed to deliver at the perimeter, edge or predesignated spots, or at the doorstep without any contact with the customer, through 100% contactless prepaid orders and delivery within the permitted delivery window.",
            ],
          },
          {
            title: "Company-level passes, not individual ones",
            description: "A no-pass directive to be issued.",
            points: [
              "Traditional curfew passes issued against individual names are not feasible. Companies are unable to utilise these passes fully owing to high absenteeism, leading to wastage of passes, whereas local authorities see only the large number of passes issued to a company.",
            ],
          },
        ],
        table: { title: "", headers: [], rows: [] },
      },
    ],
    seo: {
      metaTitle: "Government Engagements | IFMA",
      metaDescription:
        "IFMA government engagements, policy advocacy, QCO, BIS standards, and pre-budget recommendations for ceiling fan industry.",
      keywords: [
        "Government Engagements",
        "IFMA",
        "BIS Standard",
        "QCO Fans",
        "BEE Star Rating",
      ],
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
      bulletHeading:
        slug === "bee-star-rating" ? beeStarRatingContent.bulletHeading : "",
      bullets: slug === "bee-star-rating" ? beeStarRatingContent.bullets : [],
      bottomParagraphs:
        slug === "bee-star-rating" ? beeStarRatingContent.bottomParagraphs : [],
      cta: {
        label:
          slug === "bee-star-rating"
            ? beeStarRatingContent.ctaLabel
            : "Read more on this BIS link",
        url: "",
      },
    },
    bisBeeContent: {
      introHeadingPrimary: "",
      introHeadingHighlight: "",
      introParagraphs: [],
      sections: [],
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  };

  if (slug === "atmanirbhar") {
    return {
      ...baseValues,
      bannerSection: {
        title: "Atmanirbhar",
        highlightedTitle: "",
        image: "",
      },
      detailsSection: {
        ...baseValues.detailsSection,
        heading: "Atmanirbhar",
        introParagraphs: [],
        bulletHeading: "",
        bullets: [],
        bottomParagraphs: [],
        cta: { label: "", url: "" },
      },
      richContent: { html: atmanirbharRichHtml },
      atmanirbharSections: [
        {
          id: "lead",
          eyebrow: "Self-reliant India",
          title: "An industry",
          highlightedTitle: "made in India",
          paragraphs: [{ text: "The Indian fan industry, comprising of several players, has been at the forefront of innovation and adoption of new technology for the greater good of the society. Having one of the highest penetration levels - close to ~80% market penetration, touching the lives of 100 crore citizens of India - fans are a mass market product due to their functionality and benefit against the ever-looming heatwave in India.", style: "normal" }],
          highlightedParagraph: "Almost 90% of all the fans sold in India are 'Made-in-India'.",
          stats: [
            { value: "~80%", label: "Market penetration" },
            { value: "100 crore", label: "Citizens whose lives fans touch" },
            { value: "~100%", label: "Localised manufacturing capacity for ceiling fans" },
            { value: "~90%", label: "Of fans sold in India are Made in India" },
          ],
          cards: [],
        },
        {
          id: "indigenised",
          eyebrow: "The manufacturing base",
          title: "One of the most",
          highlightedTitle: "highly indigenised industries",
          paragraphs: [{ text: "We are proud to state the fact that the electrical fans industry is one of the most highly indigenised industries. We are happy to inform you that the manufacturing capacity in the country today is ~100% localised for ceiling fans. Further, almost 90% of all the fans sold in India are 'Made-in-India'.", style: "normal" }, { text: "With further impetus in the form of research and development of a newer form of components for fans that are energy efficient, such as BLDC motors, the aim is to make the industry independent of import of raw material and self-reliant in all senses.", style: "normal" }],
          highlightedParagraph: "The industry ties itself to the Atmanirbhar Bharat Abhiyaan - the Self-reliant India vision of our Hon'ble Prime Minister Shri Narendra Modi.",
          stats: [],
          cards: [],
        },
        {
          id: "pillars",
          eyebrow: "Atmanirbhar Bharat",
          title: "Touching all the",
          highlightedTitle: "pillars of self-reliance",
          paragraphs: [{ text: "The fan industry touches all the pillars of self-reliance, viz.", style: "normal" }],
          highlightedParagraph: "",
          stats: [],
          cards: [
            { title: "Economy", description: "A mass-market product with one of the highest penetration levels in the country, supporting an entire domestic value chain of vendors, distributors and channel partners." },
            { title: "Infrastructure", description: "Manufacturing capacity in the country today is ~100% localised for ceiling fans, built on plants and tooling established within India." },
            { title: "System", description: "Research and development of newer, energy-efficient components such as BLDC motors is moving the industry to technology-driven production." },
            { title: "Vibrant demography", description: "Fans touch the lives of 100 crore citizens of India - a product made by Indians, for Indian homes and workplaces." },
            { title: "Demand", description: "Almost 90% of all fans sold in India are Made in India, meeting domestic demand from domestic production rather than imports." },
          ],
        },
        {
          id: "aim",
          eyebrow: "The aim",
          title: "Independent of imported raw material.",
          highlightedTitle: "Self-reliant in all senses.",
          paragraphs: [{ text: "Energy-efficient innovation - led by BLDC motors and continued investment in research and development - is what carries the industry there.", style: "normal" }],
          highlightedParagraph: "",
          stats: [],
          cards: [],
        },
      ],
      seo: {
        metaTitle: "Atmanirbhar | IFMA",
        metaDescription:
          "Atmanirbhar policy page content for the Indian fan industry.",
        keywords: [
          "Atmanirbhar",
          "IFMA",
          "Indian fan industry",
          "Self-reliant India",
        ],
      },
    };
  }

  if (slug === "govt-engagements") {
    return {
      ...baseValues,
      hero: {
        title: "",
        highlightedTitle: "",
        bannerImage: { url: "", alt: "" },
      },
      introduction: {
        eyebrow: "",
        title: "",
        highlightedTitle: "",
        body: "",
        concernsHeading: "",
      },
      issues: {
        eyebrow: "",
        title: "",
        highlightedTitle: "",
        description: "",
        supplySide: { title: "", points: [] },
        demandSide: { title: "", points: [] },
      },
      sections: [],
      seo: { metaTitle: "", metaDescription: "", keywords: [] },
    };
  }

  return baseValues;
};
