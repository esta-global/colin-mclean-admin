import * as Yup from "yup";

export interface SustainabilityItem { label: string; description: string; }
export interface SustainabilityGroup { title: string; items: SustainabilityItem[]; }
export interface SustainabilityImage { image: string; alt: string; caption: string; }
export interface SustainabilitySection { id: string; title: string; subtitle: string; itemsTitle: string; paragraphs: string[]; footerParagraphs: string[]; items: SustainabilityItem[]; groups: SustainabilityGroup[]; images: SustainabilityImage[]; }
export interface SustainabilityPageValues { name: string; breadcrumb: { title: string; bannerImage: string }; intro: { title: string; paragraphs: string[] }; sections: SustainabilitySection[]; seo: { metaTitle: string; metaDescription: string; keywords: string[] }; _id?: string; }

const item = Yup.object({ label: Yup.string(), description: Yup.string() });
const group = Yup.object({ title: Yup.string(), items: Yup.array().of(item) });
export const sustainabilityPageSchema = Yup.object({ name: Yup.string().required(), breadcrumb: Yup.object({ title: Yup.string(), bannerImage: Yup.string() }), intro: Yup.object({ title: Yup.string(), paragraphs: Yup.array().of(Yup.string()) }), sections: Yup.array().of(Yup.object({ id: Yup.string(), title: Yup.string(), subtitle: Yup.string(), paragraphs: Yup.array().of(Yup.string()), items: Yup.array().of(item), groups: Yup.array().of(group), images: Yup.array().of(Yup.object({ image: Yup.string(), alt: Yup.string(), caption: Yup.string() })) })), seo: Yup.object({ metaTitle: Yup.string(), metaDescription: Yup.string(), keywords: Yup.array().of(Yup.string()) }) });
export const emptyItem = (): SustainabilityItem => ({ label: "", description: "" });
export const emptySection = (): SustainabilitySection => ({ id: "", title: "", subtitle: "", itemsTitle: "", paragraphs: [], footerParagraphs: [], items: [], groups: [], images: [] });
export const sustainabilityPageInitialValues: SustainabilityPageValues = { name: "Sustainability", breadcrumb: { title: "Sustainability", bannerImage: "" }, intro: { title: "", paragraphs: [] }, sections: [], seo: { metaTitle: "", metaDescription: "", keywords: [] } };
