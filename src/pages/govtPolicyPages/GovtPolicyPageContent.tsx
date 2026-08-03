import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile } from "../../utills/addUrlToFile";
import {
  GovtPolicyPageValues,
  createGovtPolicyPageInitialValues,
  govtPolicyPageSchema,
  govtPolicyPages,
} from "../../validationSchemas/govtPolicyPageSchema";

type ApiBody = Partial<GovtPolicyPageValues> & {
  _id?: string;
  __v?: number;
  slug?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MediaRecord = { _id?: string; filename: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeValues<T>(initial: T, incoming: unknown): T {
  if (Array.isArray(initial)) return (Array.isArray(incoming) ? incoming : initial) as T;
  if (isPlainObject(initial)) {
    const source = isPlainObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};
    Object.keys(initial).forEach((key) => {
      result[key] = mergeValues(initial[key], source[key]);
    });
    return result as T;
  }
  return (incoming === undefined || incoming === null ? initial : incoming) as T;
}

function stripApiFields(data: ApiBody): Partial<GovtPolicyPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.slug;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: GovtPolicyPageValues): GovtPolicyPageValues {
  if (!values) return values;
  const ds = values.detailsSection || {
    heading: "",
    paragraphs: [],
    introParagraphs: [],
    bulletHeading: "",
    bullets: [],
    bottomParagraphs: [],
    cta: { label: "", url: "" },
  };
  const seo = values.seo || {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  };

  return {
    ...values,
    detailsSection: {
      heading: ds.heading || "",
      paragraphs: (ds.paragraphs || []).map((item) => (item || "").trim()).filter(Boolean),
      introParagraphs: (ds.introParagraphs || []).map((item) => (item || "").trim()).filter(Boolean),
      bulletHeading: (ds.bulletHeading || "").trim(),
      bullets: (ds.bullets || []).map((item) => (item || "").trim()).filter(Boolean),
      bottomParagraphs: (ds.bottomParagraphs || [])
        .map((item) => ({ text: (item?.text || "").trim(), isItalic: Boolean(item?.isItalic) }))
        .filter((item) => item.text),
      cta: {
        label: (ds.cta?.label || "").trim(),
        url: (ds.cta?.url || "").trim(),
      },
    },
    seo: {
      metaTitle: seo.metaTitle || "",
      metaDescription: seo.metaDescription || "",
      keywords: (seo.keywords || []).map((k) => (k || "").trim()).filter(Boolean),
    },
  };
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="about-page-section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

export function GovtPolicyPageContent() {
  const params = useParams();
  const slug = params.slug || "bis-specifications";
  const pageConfig = govtPolicyPages.find((page) => page.slug === slug) || govtPolicyPages[0];
  const emptyValues = useMemo(() => createGovtPolicyPageInitialValues(pageConfig.label, pageConfig.slug), [pageConfig.label, pageConfig.slug]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: emptyValues,
    enableReinitialize: true,
    validationSchema: govtPolicyPageSchema,
    onSubmit: async (formValues: GovtPolicyPageValues, helpers: FormikHelpers<GovtPolicyPageValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put(`/govtPolicyPages/${slug}`, payload)
        : await post(`/govtPolicyPages/${slug}`, payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Govt policy page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save govt policy page");
      }
      setUpdating(false);
    },
  });

  const keywordsString = useMemo(
    () => (values?.seo?.keywords || []).map((keyword) => (keyword || "").trim()).filter(Boolean).join(", "),
    [values?.seo?.keywords],
  );

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: ApiBody, fallback?: GovtPolicyPageValues) {
    const nextValues = normalizeValues(migrateLegacyParagraphs(mergeValues(emptyValues, body ? stripApiFields(body) : fallback)));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  function migrateLegacyParagraphs(valuesToMigrate: GovtPolicyPageValues): GovtPolicyPageValues {
    if (!valuesToMigrate || !valuesToMigrate.detailsSection) return valuesToMigrate;
    if (valuesToMigrate.detailsSection.introParagraphs && valuesToMigrate.detailsSection.introParagraphs.length) return valuesToMigrate;
    return {
      ...valuesToMigrate,
      detailsSection: {
        ...valuesToMigrate.detailsSection,
        introParagraphs: valuesToMigrate.detailsSection.paragraphs || [],
      },
    };
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get(`/govtPolicyPages/${slug}`, true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        const body = apiResponse.body as ApiBody;
        const nextValues = normalizeValues(migrateLegacyParagraphs(mergeValues(emptyValues, stripApiFields(body))));
        setValues(nextValues);
        setHasExistingData(true);
      } else {
        setValues(emptyValues);
        setHasExistingData(false);
      }
      setLoading(false);
    }
    fetchPage();
  }, [emptyValues, setValues, slug]);

  useEffect(() => {
    async function fetchMedia() {
      let url = `/media?page=${pagination.page}&limit=${pagination.limit}`;
      if (searchQuery) url += `&searchQuery=${searchQuery}`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status === 200) {
        setRecords(apiResponse.body || []);
        setPagination((old) => ({
          ...old,
          page: apiResponse?.page as number,
          totalPages: apiResponse?.totalPages as number,
          totalRecords: apiResponse?.totalRecords as number,
        }));
      } else setRecords([]);
    }
    fetchMedia();
  }, [pagination.page, pagination.limit, searchQuery]);

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return toast.error("Please select at least one file.");
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) formData.append("files", file);
      else toast.error("Only JPG, PNG, and WEBP images are allowed.");
    });
    if (!formData.has("files")) return;
    try {
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(`${API_URL}/media`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiData = await apiResponse.json();
      if (apiData.status === 200) {
        setRecords((old) => [...apiData.body, ...old]);
        toast.success(apiData.message || "Image uploaded successfully");
      } else toast.error(apiData.message || "Unable to upload image");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image");
    }
    event.target.value = "";
  }

  return (
    <div className="content-wrapper about-page-admin past-chairmen-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Govt Policies</span>
          </div>
          <h1>{pageConfig.label}</h1>
          <p>Manage banner image, page text, CTA button, and SEO. Header and footer stay separate.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            {slug === "govt-engagements" ? (
              <>
                {/* Hero Section */}
                <section className="card about-page-card">
                  <div className="card-body">
                    <SectionHeading eyebrow="Hero / Banner" title="Header & Banner Section" />
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Hero Title</label>
                        <input className="form-control" name="hero.title" onBlur={handleBlur} onChange={handleChange} placeholder="Government" value={values.hero?.title || ""} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Highlighted Title</label>
                        <input className="form-control" name="hero.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Engagements" value={values.hero?.highlightedTitle || ""} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Banner Image</label>
                        <div className="about-page-image-field is-wide">
                          {values.hero?.bannerImage?.url ? (
                            <button aria-label="Clear banner image" className="about-page-image-clear" onClick={() => setFieldValue("hero.bannerImage.url", "")} type="button">
                              <i className="fa fa-times"></i>
                            </button>
                          ) : null}
                          <button className="about-page-image-picker" data-bs-target="#selectGovtPolicyImageFileModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("hero.bannerImage.url")} type="button">
                            <img src={values.hero?.bannerImage?.url ? addUrlToFile(values.hero.bannerImage.url) : "/images/select-photo.png"} alt="Banner" />
                            <span>Select Hero Banner Image</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Introduction Section */}
                <section className="card about-page-card">
                  <div className="card-body">
                    <SectionHeading eyebrow="Top Cards" title="Introduction Section" />
                    <div className="row g-4">
                      {/* Left Card */}
                      <div className="col-md-6">
                        <div className="p-3 border rounded">
                          <h5 className="mb-3 font-weight-bold">Left Card (Standard Revision)</h5>
                          <div className="form-group">
                            <label>Title</label>
                            <input className="form-control" name="introduction.leftCard.title" onBlur={handleBlur} onChange={handleChange} value={values.introduction?.leftCard?.title || ""} />
                          </div>
                          <div className="form-group">
                            <label>Description</label>
                            <textarea className="form-control" rows={3} name="introduction.leftCard.description" onBlur={handleBlur} onChange={handleChange} value={values.introduction?.leftCard?.description || ""} />
                          </div>
                          <div className="form-group">
                            <label>Link Text</label>
                            <input className="form-control" name="introduction.leftCard.linkText" onBlur={handleBlur} onChange={handleChange} value={values.introduction?.leftCard?.linkText || ""} />
                          </div>
                          <div className="form-group mb-0">
                            <label>Link URL</label>
                            <input className="form-control" name="introduction.leftCard.linkUrl" onBlur={handleBlur} onChange={handleChange} value={values.introduction?.leftCard?.linkUrl || ""} />
                          </div>
                        </div>
                      </div>
                      {/* Right Card */}
                      <div className="col-md-6">
                        <div className="p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 font-weight-bold">Right Card (Enforcement Requirements)</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setFieldValue("introduction.rightCard.points", [...(values.introduction?.rightCard?.points || []), { text: "" }])} type="button">+ Add Point</button>
                          </div>
                          <div className="form-group">
                            <label>Title</label>
                            <input className="form-control" name="introduction.rightCard.title" onBlur={handleBlur} onChange={handleChange} value={values.introduction?.rightCard?.title || ""} />
                          </div>
                          <div className="industry-editor-list">
                            {(values.introduction?.rightCard?.points || []).map((point, pIndex) => (
                              <div className="industry-editor-row" key={pIndex}>
                                <input className="form-control" name={`introduction.rightCard.points.${pIndex}.text`} onBlur={handleBlur} onChange={handleChange} placeholder="Requirement text" value={point.text} />
                                <button onClick={() => setFieldValue("introduction.rightCard.points", (values.introduction?.rightCard?.points || []).filter((_, idx) => idx !== pIndex))} type="button"><i className="fa fa-times"></i></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Issues Section */}
                <section className="card about-page-card">
                  <div className="card-body">
                    <SectionHeading eyebrow="Issues & Risks" title="Supply Side vs Demand Risk Issues" />
                    <div className="row g-4">
                      {/* Supply Side */}
                      <div className="col-md-6">
                        <div className="p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 font-weight-bold">Supply Side Issues</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setFieldValue("issues.supplySide.points", [...(values.issues?.supplySide?.points || []), { text: "" }])} type="button">+ Add Issue</button>
                          </div>
                          <div className="form-group">
                            <label>Section Title</label>
                            <input className="form-control" name="issues.supplySide.title" onBlur={handleBlur} onChange={handleChange} value={values.issues?.supplySide?.title || ""} />
                          </div>
                          <div className="industry-editor-list">
                            {(values.issues?.supplySide?.points || []).map((point, pIndex) => (
                              <div className="industry-editor-row" key={pIndex}>
                                <input className="form-control" name={`issues.supplySide.points.${pIndex}.text`} onBlur={handleBlur} onChange={handleChange} placeholder="Supply issue text" value={point.text} />
                                <button onClick={() => setFieldValue("issues.supplySide.points", (values.issues?.supplySide?.points || []).filter((_, idx) => idx !== pIndex))} type="button"><i className="fa fa-times"></i></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Demand Side */}
                      <div className="col-md-6">
                        <div className="p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 font-weight-bold">Demand Risk Issues</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setFieldValue("issues.demandSide.points", [...(values.issues?.demandSide?.points || []), { text: "" }])} type="button">+ Add Issue</button>
                          </div>
                          <div className="form-group">
                            <label>Section Title</label>
                            <input className="form-control" name="issues.demandSide.title" onBlur={handleBlur} onChange={handleChange} value={values.issues?.demandSide?.title || ""} />
                          </div>
                          <div className="industry-editor-list">
                            {(values.issues?.demandSide?.points || []).map((point, pIndex) => (
                              <div className="industry-editor-row" key={pIndex}>
                                <input className="form-control" name={`issues.demandSide.points.${pIndex}.text`} onBlur={handleBlur} onChange={handleChange} placeholder="Demand risk text" value={point.text} />
                                <button onClick={() => setFieldValue("issues.demandSide.points", (values.issues?.demandSide?.points || []).filter((_, idx) => idx !== pIndex))} type="button"><i className="fa fa-times"></i></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Dynamic Content Sections Manager */}
                <section className="card about-page-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <SectionHeading eyebrow="Page Content Sections" title="Custom Sections, Tables & Cards" />
                      <button className="btn btn-primary btn-sm" onClick={() => setFieldValue("sections", [...(values.sections || []), { id: `section-${Date.now()}`, title: "", description: "", buttons: [], cards: [], table: { title: "", headers: [], rows: [] } }])} type="button">+ Add Section</button>
                    </div>
                    {(values.sections || []).map((section, sIndex) => (
                      <div className="p-3 border rounded mb-4 bg-light" key={sIndex}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <strong className="text-primary fs-5">Section #{sIndex + 1}: {section.title || "Untitled Section"}</strong>
                          <button className="btn btn-sm btn-danger" onClick={() => setFieldValue("sections", (values.sections || []).filter((_, idx) => idx !== sIndex))} type="button"><i className="fa fa-trash"></i> Remove Section</button>
                        </div>
                        <div className="form-group">
                          <label>Section Title</label>
                          <input className="form-control" name={`sections.${sIndex}.title`} onBlur={handleBlur} onChange={handleChange} placeholder="Section title" value={section.title} />
                        </div>
                        <div className="form-group">
                          <label>Section Description / Paragraphs</label>
                          <textarea className="form-control" rows={4} name={`sections.${sIndex}.description`} onBlur={handleBlur} onChange={handleChange} placeholder="Detailed text content..." value={section.description} />
                        </div>

                        {/* Highlight Callout Buttons */}
                        <div className="mb-3 border p-2 bg-white rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Callout / Highlight Boxes</strong>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFieldValue(`sections.${sIndex}.buttons`, [...(section.buttons || []), { title: "", subtitle: "", url: "" }])} type="button">+ Add Box</button>
                          </div>
                          {(section.buttons || []).map((btn, bIndex) => (
                            <div className="row g-2 mb-2 align-items-center" key={bIndex}>
                              <div className="col-md-5">
                                <input className="form-control form-control-sm" name={`sections.${sIndex}.buttons.${bIndex}.title`} onChange={handleChange} placeholder="Box title" value={btn.title} />
                              </div>
                              <div className="col-md-6">
                                <input className="form-control form-control-sm" name={`sections.${sIndex}.buttons.${bIndex}.subtitle`} onChange={handleChange} placeholder="Box subtitle" value={btn.subtitle} />
                              </div>
                              <div className="col-md-1">
                                <button className="btn btn-sm btn-outline-danger w-100" onClick={() => setFieldValue(`sections.${sIndex}.buttons`, (section.buttons || []).filter((_, idx) => idx !== bIndex))} type="button"><i className="fa fa-times"></i></button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cards Grid */}
                        <div className="mb-3 border p-2 bg-white rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Cards Grid (e.g. GST Rationalization Pillars)</strong>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFieldValue(`sections.${sIndex}.cards`, [...(section.cards || []), { title: "", description: "", points: [] }])} type="button">+ Add Card</button>
                          </div>
                          {(section.cards || []).map((cardItem, cIndex) => (
                            <div className="border p-2 mb-2 rounded bg-light" key={cIndex}>
                              <div className="d-flex justify-content-between mb-2">
                                <span className="fw-bold">Card #{cIndex + 1}</span>
                                <button className="btn btn-sm text-danger" onClick={() => setFieldValue(`sections.${sIndex}.cards`, (section.cards || []).filter((_, idx) => idx !== cIndex))} type="button"><i className="fa fa-times"></i></button>
                              </div>
                              <div className="form-group mb-2">
                                <input className="form-control form-control-sm" name={`sections.${sIndex}.cards.${cIndex}.title`} onChange={handleChange} placeholder="Card title" value={cardItem.title} />
                              </div>
                              <div className="form-group mb-0">
                                <input className="form-control form-control-sm" name={`sections.${sIndex}.cards.${cIndex}.description`} onChange={handleChange} placeholder="Card description" value={cardItem.description} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Data Table */}
                        <div className="border p-2 bg-white rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Data Table (e.g. Ceiling Fan Attributes / Pre-Budget Memo)</strong>
                          </div>
                          <div className="form-group mb-2">
                            <label>Table Title</label>
                            <input className="form-control form-control-sm" name={`sections.${sIndex}.table.title`} onChange={handleChange} placeholder="e.g. TABLE 1: REVISED ATTRIBUTES" value={section.table?.title || ""} />
                          </div>
                          <div className="form-group mb-2">
                            <label>Headers (comma-separated)</label>
                            <input className="form-control form-control-sm" onChange={(e) => setFieldValue(`sections.${sIndex}.table.headers`, e.target.value.split(",").map((h) => h.trim()))} placeholder="Category, Recommendation, Rationale" value={(section.table?.headers || []).join(", ")} />
                          </div>
                          <div className="mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <label className="mb-0">Table Rows</label>
                              <button className="btn btn-sm btn-outline-success" onClick={() => setFieldValue(`sections.${sIndex}.table.rows`, [...(section.table?.rows || []), new Array(section.table?.headers?.length || 3).fill("")])} type="button">+ Add Row</button>
                            </div>
                            {(section.table?.rows || []).map((rowArray, rIndex) => (
                              <div className="d-flex gap-2 mb-2 align-items-center" key={rIndex}>
                                {rowArray.map((cell, cellIdx) => (
                                  <input className="form-control form-control-sm" key={cellIdx} onChange={(e) => {
                                    const nextRows = [...(section.table?.rows || [])];
                                    const nextRow = [...nextRows[rIndex]];
                                    nextRow[cellIdx] = e.target.value;
                                    nextRows[rIndex] = nextRow;
                                    setFieldValue(`sections.${sIndex}.table.rows`, nextRows);
                                  }} placeholder={`Col ${cellIdx + 1}`} value={cell} />
                                ))}
                                <button className="btn btn-sm btn-outline-danger" onClick={() => setFieldValue(`sections.${sIndex}.table.rows`, (section.table?.rows || []).filter((_, idx) => idx !== rIndex))} type="button"><i className="fa fa-times"></i></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="card about-page-card">
                  <div className="card-body">
                    <SectionHeading eyebrow="Govt Policies" title="Banner Section" />
                    <div className="about-page-simple-grid">
                      <div className="about-page-field-grid">
                        <input className="form-control" name="name" onBlur={handleBlur} onChange={handleChange} placeholder="Page name" value={values.name} />
                        <input className="form-control" name="bannerSection.title" onBlur={handleBlur} onChange={handleChange} placeholder="BIS" value={values.bannerSection.title} />
                        <input className="form-control" name="bannerSection.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Specifications" value={values.bannerSection.highlightedTitle} />
                      </div>
                      <div className="about-page-image-field is-wide">
                        {values.bannerSection.image ? (
                          <button aria-label="Clear banner image" className="about-page-image-clear" onClick={() => setFieldValue("bannerSection.image", "")} type="button">
                            <i className="fa fa-times"></i>
                          </button>
                        ) : null}
                        <button className="about-page-image-picker" data-bs-target="#selectGovtPolicyImageFileModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("bannerSection.image")} type="button">
                          <img src={values.bannerSection.image ? addUrlToFile(values.bannerSection.image) : "/images/select-photo.png"} alt="Govt policy banner" />
                          <span>Select banner image</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="card about-page-card">
                  <div className="card-body">
                    <SectionHeading eyebrow="Govt Policies" title="Content Section" />
                    <input className="form-control mb-3" name="detailsSection.heading" onBlur={handleBlur} onChange={handleChange} placeholder="Page heading" value={values.detailsSection.heading} />
                    <div className="industry-editor-list">
                      <div className="industry-editor-list__head">
                        <strong>Intro Paragraphs</strong>
                        <button onClick={() => setFieldValue("detailsSection.introParagraphs", [...values.detailsSection.introParagraphs, ""])} type="button">+ Add Paragraph</button>
                      </div>
                      {values.detailsSection.introParagraphs.map((paragraph, index) => (
                        <div className="industry-editor-row" key={index}>
                          <textarea className="form-control" name={`detailsSection.introParagraphs.${index}`} onBlur={handleBlur} onChange={handleChange} placeholder="Paragraph text" value={paragraph} />
                          <button onClick={() => setFieldValue("detailsSection.introParagraphs", values.detailsSection.introParagraphs.filter((_, itemIndex) => itemIndex !== index))} type="button"><i className="fa fa-times"></i></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="card about-page-card">
                  <div className="card-body">
                    <SectionHeading eyebrow="Govt Policies" title="Bullet Section" />
                    <input className="form-control mb-3" name="detailsSection.bulletHeading" onBlur={handleBlur} onChange={handleChange} placeholder="BEE performs regulatory and promotional functions including:" value={values.detailsSection.bulletHeading} />
                    <div className="industry-editor-list">
                      <div className="industry-editor-list__head">
                        <strong>Bullet Points</strong>
                        <button onClick={() => setFieldValue("detailsSection.bullets", [...values.detailsSection.bullets, ""])} type="button">+ Add Bullet</button>
                      </div>
                      {values.detailsSection.bullets.map((bullet, index) => (
                        <div className="industry-editor-row" key={index}>
                          <textarea className="form-control" name={`detailsSection.bullets.${index}`} onBlur={handleBlur} onChange={handleChange} placeholder="Bullet text" value={bullet} />
                          <button onClick={() => setFieldValue("detailsSection.bullets", values.detailsSection.bullets.filter((_, itemIndex) => itemIndex !== index))} type="button"><i className="fa fa-times"></i></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="card about-page-card">
                  <div className="card-body">
                    <SectionHeading eyebrow="Govt Policies" title="Bottom Paragraphs" />
                    <div className="industry-editor-list">
                      <div className="industry-editor-list__head">
                        <strong>Bottom Paragraphs</strong>
                        <button onClick={() => setFieldValue("detailsSection.bottomParagraphs", [...values.detailsSection.bottomParagraphs, { text: "", isItalic: false }])} type="button">+ Add Paragraph</button>
                      </div>
                      {values.detailsSection.bottomParagraphs.map((paragraph, index) => (
                        <div className="industry-editor-row" key={index}>
                          <div className="w-100">
                            <textarea className="form-control" name={`detailsSection.bottomParagraphs.${index}.text`} onBlur={handleBlur} onChange={handleChange} placeholder="Paragraph text" value={paragraph.text} />
                            <label className="d-flex align-items-center gap-2 mt-2 mb-0">
                              <input checked={paragraph.isItalic} name={`detailsSection.bottomParagraphs.${index}.isItalic`} onChange={(event) => setFieldValue(`detailsSection.bottomParagraphs.${index}.isItalic`, event.target.checked)} type="checkbox" />
                              Italic text
                            </label>
                          </div>
                          <button onClick={() => setFieldValue("detailsSection.bottomParagraphs", values.detailsSection.bottomParagraphs.filter((_, itemIndex) => itemIndex !== index))} type="button"><i className="fa fa-times"></i></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="card about-page-card">
                  <div className="card-body">
                    <SectionHeading eyebrow="Govt Policies" title="CTA Button" />
                    <div className="industry-link-grid">
                      <div className="industry-link-card">
                        <input className="form-control" name="detailsSection.cta.label" onBlur={handleBlur} onChange={handleChange} placeholder="Read more on this BIS link" value={values.detailsSection.cta.label} />
                        <input className="form-control" name="detailsSection.cta.url" onBlur={handleBlur} onChange={handleChange} placeholder="URL" value={values.detailsSection.cta.url} />
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Search" title="SEO" />
                <div className="row">
                  <div className="form-group col-md-6">
                    <label>Meta Title</label>
                    <input className="form-control" name="seo.metaTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Meta title" value={values.seo.metaTitle} />
                  </div>
                  <div className="form-group col-md-12">
                    <TextareaBox label="Meta Description" name="seo.metaDescription" handleBlur={handleBlur} handleChange={handleChange} placeholder="Meta description" value={values.seo.metaDescription} touched={getTouched("seo.metaDescription")} error={getError("seo.metaDescription")} />
                  </div>
                  <div className="form-group col-md-12 mb-0">
                    <TextareaBox label="SEO Keywords" name="seo.keywords" handleBlur={() => {}} handleChange={(event) => {
                      const keywords = event.target.value.split(",").map((keyword) => keyword.trim()).filter(Boolean);
                      void setFieldValue("seo.keywords", keywords);
                    }} placeholder="keyword one, keyword two" value={keywordsString} touched={getTouched("seo.keywords")} error={getError("seo.keywords")} />
                  </div>
                </div>
              </div>
            </section>

            <div className="about-page-sticky-actions">
              <div><strong>{pageConfig.label}</strong><span>Save govt policy page content.</span></div>
              <SubmitButton loading={updating} text="Update Page" />
            </div>
          </main>
        </div>
      </form>

      <div className="modal fade" id="selectGovtPolicyImageFileModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectGovtPolicyImageFileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectGovtPolicyImageFileModalLabel">Select Image</h1>
              <input type="file" onChange={handleUploadFile} />
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="about-page-media-toolbar">
                <input className="form-control" onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search media" type="search" value={searchQuery} />
              </div>
              <div className="row mb-2 gy-2 media-list-section">
                {records.map((item) => (
                  <div className="col-md-2 col-4" key={item._id || item.filename}>
                    <button className="about-page-media-card" data-bs-dismiss="modal" onClick={() => setFieldValue(selectedFileFor, item.filename)} type="button">
                      <img src={addUrlToFile(item.filename)} alt="" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-3"><Pagination pagination={pagination} setPagination={setPagination} tableName="table-to-xls" csvFileName="images" /></div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary px-3 py-2" data-bs-dismiss="modal">Close</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
