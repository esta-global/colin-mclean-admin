import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile } from "../../utills/addUrlToFile";
import {
  createEmptyIndustryHighlight,
  createEmptyIndustryLink,
  IndustryDetailsPageValues,
  industryDetailsPageInitialValues,
  industryDetailsPageSchema,
} from "../../validationSchemas/industryDetailsPageSchema";

type ApiBody = Partial<IndustryDetailsPageValues> & {
  _id?: string;
  __v?: number;
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

function stripApiFields(data: ApiBody): Partial<IndustryDetailsPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: IndustryDetailsPageValues): IndustryDetailsPageValues {
  return {
    ...values,
    contentSections: (values.contentSections || []).map((section) => ({
      ...section,
      items: (section.items || []).map((item) => ({
        ...item,
        eyebrow: (item.eyebrow || "").trim(),
        title: (item.title || "").trim(),
        description: (item.description || "").trim(),
        value: (item.value || "").trim(),
        label: (item.label || "").trim(),
        year: (item.year || "").trim(),
        footer: (item.footer || "").trim(),
      })),
    })),
    detailsSection: {
      ...values.detailsSection,
      paragraphs: values.detailsSection.paragraphs.map((item) => item.trim()).filter(Boolean),
      highlights: values.detailsSection.highlights
        .map((item) => ({ ...item, text: item.text.trim() }))
        .filter((item) => item.text),
      links: values.detailsSection.links
        .map((item) => ({ label: item.label.trim(), url: item.url.trim() }))
        .filter((item) => item.label || item.url),
    },
    seo: {
      ...values.seo,
      keywords: values.seo.keywords.filter((keyword) => keyword.trim()),
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

const emptyIndustryContentItem = () => ({ eyebrow: "", title: "", description: "", value: "", label: "", year: "", footer: "" });

function IndustryContentSectionsEditor({
  sections,
  setFieldValue,
}: {
  sections: IndustryDetailsPageValues["contentSections"];
  setFieldValue: (field: string, value: unknown) => void;
}) {
  const update = (field: string, value: unknown) => setFieldValue(`contentSections.${field}`, value);
  return (
    <section className="card about-page-card">
      <div className="card-body">
        <div className="industry-editor-list__head">
          <SectionHeading eyebrow="Industry Details" title="Content Sections" />
          <button onClick={() => setFieldValue("contentSections", [...sections, { id: `section-${Date.now()}`, eyebrow: "", title: "", highlightedTitle: "", description: "", items: [] }])} type="button">+ Add Section</button>
        </div>
        {sections.map((section, sectionIndex) => (
          <div className="border rounded p-3 mb-4" key={`${section.id}-${sectionIndex}`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <strong>Section {sectionIndex + 1}</strong>
              <button className="btn btn-sm btn-outline-danger" onClick={() => setFieldValue("contentSections", sections.filter((_, index) => index !== sectionIndex))} type="button">Remove Section</button>
            </div>
            <div className="row g-2 mb-3">
              {([["id", "Section ID"], ["eyebrow", "Eyebrow"], ["title", "Main Heading"], ["highlightedTitle", "Highlighted Heading"]] as const).map(([field, label]) => (
                <div className="col-md-3" key={field}><label className="form-label">{label}</label><input className="form-control" value={section[field]} onChange={(event) => update(`${sectionIndex}.${field}`, event.target.value)} /></div>
              ))}
            </div>
            <label className="form-label">Section Description</label>
            <textarea className="form-control mb-3" rows={3} value={section.description} onChange={(event) => update(`${sectionIndex}.description`, event.target.value)} />
            <div className="industry-editor-list__head"><strong>Section Items</strong><button onClick={() => update(`${sectionIndex}.items`, [...section.items, emptyIndustryContentItem()])} type="button">+ Add Item</button></div>
            {section.items.map((item, itemIndex) => (
              <div className="border rounded p-2 mb-2 bg-light" key={itemIndex}>
                <div className="row g-2">
                  <div className="col-md-3"><input className="form-control" placeholder="Item eyebrow / number" value={item.eyebrow} onChange={(event) => update(`${sectionIndex}.items.${itemIndex}.eyebrow`, event.target.value)} /></div>
                  <div className="col-md-5"><input className="form-control" placeholder="Item title" value={item.title} onChange={(event) => update(`${sectionIndex}.items.${itemIndex}.title`, event.target.value)} /></div>
                  <div className="col-md-3"><input className="form-control" placeholder="Year / value" value={item.year || item.value} onChange={(event) => update(`${sectionIndex}.items.${itemIndex}.${section.id === "snapshot" ? "value" : "year"}`, event.target.value)} /></div>
                  <div className="col-md-1"><button className="btn btn-sm btn-outline-danger w-100" onClick={() => update(`${sectionIndex}.items`, section.items.filter((_, index) => index !== itemIndex))} type="button"><i className="fa fa-times"></i></button></div>
                  <div className="col-md-6"><textarea className="form-control" rows={2} placeholder="Item description / stat label" value={item.description || item.label} onChange={(event) => update(`${sectionIndex}.items.${itemIndex}.${section.id === "snapshot" ? "label" : "description"}`, event.target.value)} /></div>
                  <div className="col-md-6"><input className="form-control" placeholder="Footer / supporting text" value={item.footer} onChange={(event) => update(`${sectionIndex}.items.${itemIndex}.footer`, event.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function IndustryDetailsPageContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: industryDetailsPageInitialValues,
    validationSchema: industryDetailsPageSchema,
    onSubmit: async (formValues: IndustryDetailsPageValues, helpers: FormikHelpers<IndustryDetailsPageValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/industryDetailsPage", payload)
        : await post("/industryDetailsPage", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Industry details page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save industry details page");
      }
      setUpdating(false);
    },
  });

  const keywordsString = useMemo(
    () => values.seo.keywords.filter((keyword) => keyword.trim()).join(", "),
    [values.seo.keywords],
  );

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: ApiBody, fallback?: IndustryDetailsPageValues) {
    const nextValues = normalizeValues(
      mergeValues(industryDetailsPageInitialValues, body ? stripApiFields(body) : fallback),
    );
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get("/industryDetailsPage", true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        syncSavedValues(apiResponse.body as ApiBody);
        setHasExistingData(true);
      } else {
        setValues(industryDetailsPageInitialValues);
        setHasExistingData(false);
      }
      setLoading(false);
    }
    fetchPage();
  }, [setValues]);

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
            <span className="about-page-admin__eyebrow">Pages</span>
          </div>
          <h1>Industry Details Page</h1>
          <p>Manage banner, industry content, highlight cards, quick links, and SEO.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Industry Details" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input className="form-control" name="bannerSection.title" onBlur={handleBlur} onChange={handleChange} placeholder="Industry" value={values.bannerSection.title} />
                    <input className="form-control" name="bannerSection.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Details" value={values.bannerSection.highlightedTitle} />
                  </div>
                  <div className="about-page-image-field is-wide">
                    {values.bannerSection.image ? (
                      <button aria-label="Clear banner image" className="about-page-image-clear" onClick={() => setFieldValue("bannerSection.image", "")} type="button">
                        <i className="fa fa-times"></i>
                      </button>
                    ) : null}
                    <button className="about-page-image-picker" data-bs-target="#selectIndustryDetailsImageFileModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("bannerSection.image")} type="button">
                      <img src={values.bannerSection.image ? addUrlToFile(values.bannerSection.image) : "/images/select-photo.png"} alt="Industry details banner" />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <IndustryContentSectionsEditor sections={values.contentSections} setFieldValue={setFieldValue} />

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Industry Details" title="Content Section" />
                <input className="form-control mb-3" name="detailsSection.heading" onBlur={handleBlur} onChange={handleChange} placeholder="Industry Details" value={values.detailsSection.heading} />
                <div className="industry-editor-list">
                  <div className="industry-editor-list__head">
                    <strong>Paragraphs</strong>
                    <button onClick={() => setFieldValue("detailsSection.paragraphs", [...values.detailsSection.paragraphs, ""])} type="button">+ Add Paragraph</button>
                  </div>
                  {values.detailsSection.paragraphs.map((paragraph, index) => (
                    <div className="industry-editor-row" key={index}>
                      <textarea className="form-control" name={`detailsSection.paragraphs.${index}`} onBlur={handleBlur} onChange={handleChange} placeholder="Paragraph text" value={paragraph} />
                      <button onClick={() => setFieldValue("detailsSection.paragraphs", values.detailsSection.paragraphs.filter((_, itemIndex) => itemIndex !== index))} type="button"><i className="fa fa-times"></i></button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="industry-editor-list__head">
                  <SectionHeading eyebrow="Industry Details" title="Highlight Cards" />
                  <button onClick={() => setFieldValue("detailsSection.highlights", [...values.detailsSection.highlights, createEmptyIndustryHighlight()])} type="button">+ Add Highlight</button>
                </div>
                <div className="industry-highlight-grid">
                  {values.detailsSection.highlights.map((highlight, index) => (
                    <div className="industry-highlight-card" key={index}>
                      <button aria-label="Remove highlight" onClick={() => setFieldValue("detailsSection.highlights", values.detailsSection.highlights.filter((_, itemIndex) => itemIndex !== index))} type="button">
                        <i className="fa fa-times"></i>
                      </button>
                      <textarea className="form-control" name={`detailsSection.highlights.${index}.text`} onBlur={handleBlur} onChange={handleChange} placeholder="Highlight text" value={highlight.text} />
                      <select className="form-control" name={`detailsSection.highlights.${index}.position`} onBlur={handleBlur} onChange={handleChange} value={highlight.position}>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="industry-editor-list__head">
                  <SectionHeading eyebrow="Industry Details" title="Bottom Links" />
                  <button onClick={() => setFieldValue("detailsSection.links", [...values.detailsSection.links, createEmptyIndustryLink()])} type="button">+ Add Link</button>
                </div>
                <div className="industry-link-grid">
                  {values.detailsSection.links.map((link, index) => (
                    <div className="industry-link-card" key={index}>
                      <input className="form-control" name={`detailsSection.links.${index}.label`} onBlur={handleBlur} onChange={handleChange} placeholder="Link label" value={link.label} />
                      <input className="form-control" name={`detailsSection.links.${index}.url`} onBlur={handleBlur} onChange={handleChange} placeholder="URL" value={link.url} />
                      <button onClick={() => setFieldValue("detailsSection.links", values.detailsSection.links.filter((_, itemIndex) => itemIndex !== index))} type="button"><i className="fa fa-times"></i></button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

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
              <div><strong>Industry Details Page</strong><span>Save page content and industry details.</span></div>
              <SubmitButton loading={updating} text="Update Details" />
            </div>
          </main>
        </div>
      </form>

      <div className="modal fade" id="selectIndustryDetailsImageFileModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectIndustryDetailsImageFileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectIndustryDetailsImageFileModalLabel">Select Image</h1>
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
