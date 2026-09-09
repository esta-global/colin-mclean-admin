import * as Yup from "yup";

export interface IndustryHighlight {
  text: string;
  position: "left" | "right";
}

export interface IndustryLink {
  label: string;
  url: string;
}

export interface IndustryContentItem {
  eyebrow: string;
  title: string;
  description: string;
  value: string;
  label: string;
  year: string;
  footer: string;
}

export interface IndustryContentSection {
  id: string;
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  description: string;
  items: IndustryContentItem[];
}

export interface IndustryDetailsPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  detailsSection: {
    heading: string;
    paragraphs: string[];
    highlights: IndustryHighlight[];
    links: IndustryLink[];
  };
  contentSections: IndustryContentSection[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyIndustryHighlight = (): IndustryHighlight => ({
  text: "",
  position: "right",
});

export const createEmptyIndustryLink = (): IndustryLink => ({
  label: "",
  url: "",
});

export const industryDetailsPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  detailsSection: Yup.object({
    heading: stringField(),
    paragraphs: Yup.array().of(stringField()),
    highlights: Yup.array().of(
      Yup.object({
        text: stringField(),
        position: Yup.string().oneOf(["left", "right"]),
      }),
    ),
    links: Yup.array().of(
      Yup.object({
        label: stringField(),
        url: stringField(),
      }),
    ),
  }),
  contentSections: Yup.array().of(
    Yup.object({
      id: stringField(), eyebrow: stringField(), title: stringField(), highlightedTitle: stringField(), description: stringField(),
      items: Yup.array().of(Yup.object({ eyebrow: stringField(), title: stringField(), description: stringField(), value: stringField(), label: stringField(), year: stringField(), footer: stringField() })),
    }),
  ),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const industryDetailsPageInitialValues: IndustryDetailsPageValues = {
  bannerSection: {
    title: "Industry",
    highlightedTitle: "Details",
    image: "",
  },
  detailsSection: {
    heading: "Industry Details",
    paragraphs: [
      "The India Fan Industry is one of the leading in the world, both in terms of manufactured quantities as well as domestic consumption. Though the invention of fans happened in the USA which also started emerging as a leading manufacturer till 1930's yet India caught up briskly. By the late 1940's India had over a score of leading Industries making Fans in India, mainly in Calcutta.",
      "Two leading brands however remained flourishing in Western India. What is interesting is that 3 of the leading brands of late 40's are still amongst the leading brands of today.",
      "This interesting fact that is not widely known that by late 40's (after the independence) Amritsar and some parts of Punjab too came into being as a large centre of small and tiny industries manufacturing fans.",
      "From Calcutta, the major manufacturers like Orient and Usha started expanding with newer factories in Faridabad / Agra in North and Hyderabad in South India.",
      "Cinni enters with a new unique model with Black Table fans. Sturdy and entirely different in looks, it took its inspiration of design and feature gramme from antique models of few American and Italian brands of 1930's.",
      "The era of mid-eighties onwards saw a large number of Industries moving into Hardwar and Himachal due to excise benefits.",
    ],
    highlights: [
      { text: "Birthplace of Indian Industry was Calcutta - beginning 1930's", position: "right" },
      { text: "In late 1940's Amritsar too became the centre of small manufacturers - which vanished in next few decades", position: "left" },
      { text: "Hyderabad and parts of North India also become alternate hubs post 1960's", position: "right" },
      { text: "Cinni from Varanasi makes a quiet but formidable entry in 1950.", position: "left" },
      { text: "In 1980's, enter Haridwar and Himachal as other manufacturing hubs", position: "right" },
    ],
    links: [
      { label: "Indian Fan Industry: How It All Began", url: "" },
      { label: "The History of Electric Fans that intrigues us all", url: "" },
    ],
  },
  contentSections: [
    {
      id: "snapshot", eyebrow: "Industry snapshot", title: "The industry at a glance", highlightedTitle: "", description: "", items: [
        { value: "1930s", label: "Calcutta emerges as the early birthplace of organised Indian fan manufacturing.", eyebrow: "", title: "", description: "", year: "", footer: "" },
        { value: "1950", label: "Leading companies join to form the Fan Makers Association, the foundation of IFMA's journey.", eyebrow: "", title: "", description: "", year: "", footer: "" },
        { value: "75+", label: "Years of togetherness, contribution and industry-wide impact celebrated by IFMA.", eyebrow: "", title: "", description: "", year: "", footer: "" },
        { value: "Next", label: "BLDC, smart connectivity, efficiency and design are shaping the next era of fans.", eyebrow: "", title: "", description: "", year: "", footer: "" },
      ],
    },
    {
      id: "journey", eyebrow: "A story of movement", title: "From clusters to a", highlightedTitle: "national industry", description: "The story is not simply about fans. It is about where capability moved, how manufacturing ecosystems formed, and how technology kept changing the meaning of a fan.", items: [
        { eyebrow: "The beginning", title: "Calcutta becomes the early hub", description: "The source page highlights Calcutta as the birthplace of the Indian fan industry, beginning in the 1930s, as manufacturing activity started to gather momentum.", value: "", label: "", year: "1930s", footer: "" },
        { eyebrow: "Scale starts forming", title: "Manufacturing expands by the 1940s", description: "By the late 1940s, the industry had developed a wider base. Amritsar also became a centre for smaller manufacturers, before many later disappeared as the industry consolidated.", value: "", label: "", year: "1940s", footer: "" },
        { eyebrow: "Association born", title: "FMA is formed in 1950", description: "The coffee-table book notes that fan manufacturing had grown vastly by 1940 and that a few leading companies joined in 1950 to form the Fan Makers Association (FMA).", value: "", label: "", year: "1950", footer: "" },
        { eyebrow: "New centres", title: "Varanasi, Hyderabad and North India", description: "Cinni's Varanasi entry and the later emergence of Hyderabad and parts of North India show how the industry's manufacturing base broadened beyond its earliest eastern and western clusters.", value: "", label: "", year: "1960s", footer: "" },
        { eyebrow: "Modernisation", title: "Haridwar & Himachal join the map", description: "By the 1980s, Haridwar and Himachal Pradesh are identified as newer manufacturing hubs, supported by ancillary infrastructure and a changing industrial landscape.", value: "", label: "", year: "1980s", footer: "" },
        { eyebrow: "Today", title: "From airflow to intelligent comfort", description: "The industry is now moving toward BLDC motors, smart connectivity, efficiency, sustainability and personalised aesthetics - a new era beyond basic airflow.", value: "", label: "", year: "Now", footer: "" },
      ],
    },
    {
      id: "ecosystem", eyebrow: "The system behind the product", title: "Three forces that keep the industry", highlightedTitle: "moving", description: "A fan is the visible output of a much larger ecosystem: manufacturing capability, technology and market evolution.", items: [
        { eyebrow: "01", title: "Manufacturing ecosystems", description: "Clusters grew around capability, labour, suppliers and ancillary infrastructure. The result is an industry that has repeatedly shifted and expanded its production footprint.", value: "", label: "", year: "", footer: "Capability -> cluster -> scale" },
        { eyebrow: "02", title: "Engineering & technology", description: "Fan design has progressed from conventional motors and blades toward BLDC platforms, aerodynamic design, low-noise operation, smart controls and higher efficiency.", value: "", label: "", year: "", footer: "Motor -> electronics -> connected product" },
        { eyebrow: "03", title: "Consumer expectations", description: "The category has moved beyond a purely functional appliance. Design aesthetics, energy efficiency, comfort and sustainability increasingly shape the product proposition.", value: "", label: "", year: "", footer: "Utility -> lifestyle -> responsibility" },
      ],
    },
    {
      id: "categories", eyebrow: "Our world of fans", title: "One category. Many expressions of airflow.", highlightedTitle: "", description: "The 75-year story now spans a broad fan universe - from everyday ceiling fans to specialist, industrial and design-led formats. The coffee-table book's contents reflect this growing diversity.", items: [
        ...["Ceiling Fans", "BLDC Fans", "Table Fans", "Wall Fans", "Pedestal Fans", "Tower Fans", "Exhaust Fans", "Industrial Exhaust Fans", "HVLS Fans", "Luxury Designer Fans", "Decorative Fans", "Bladeless Fans", "Premium Fans", "Smart Fans"].map((label) => ({ eyebrow: "", title: label, description: "", value: "", label: "", year: "", footer: "" })),
      ],
    },
  ],
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
