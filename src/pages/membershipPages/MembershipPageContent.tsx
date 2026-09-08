import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";
import {
  MembershipPageSlug,
  MembershipPageValues,
  createEmptyMembershipCard,
  membershipPageInitialValuesBySlug,
  membershipPageSchema,
  membershipPages,
} from "../../validationSchemas/membershipPageSchema";

type ApiBody = Partial<MembershipPageValues> & {
  _id?: string;
  __v?: number;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
};

type MediaRecord = { _id?: string; filename: string };
type MembershipTypeOption = { title: string; image: string; status?: boolean };

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

function stripApiFields(data: ApiBody): Partial<MembershipPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.slug;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: MembershipPageValues): MembershipPageValues {
  return {
    ...values,
    name: values.name.trim(),
    bannerSection: {
      title: values.bannerSection.title.trim(),
      highlightedTitle: values.bannerSection.highlightedTitle.trim(),
      image: values.bannerSection.image.trim(),
    },
    introSection: {
      paragraphs: values.introSection.paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean),
      highlightedText: values.introSection.highlightedText.trim(),
    },
    cardsSection: {
      cards: values.cardsSection.cards
        .map((card, index) => ({
          title: card.title.trim(),
          image: card.image.trim(),
          buttonText: card.buttonText.trim(),
          pdfFile: card.pdfFile.trim(),
          sortOrder: Number.isFinite(Number(card.sortOrder)) ? Number(card.sortOrder) : index,
          status: Boolean(card.status),
        }))
        .filter((card) => card.title || card.image || card.pdfFile || card.buttonText)
        .sort((first, second) => first.sortOrder - second.sortOrder),
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

export function MembershipPageContent() {
  const params = useParams();
  const slug: MembershipPageSlug = params.slug === "become-a-member" ? "become-a-member" : "types-of-membership";
  const pageConfig = membershipPages.find((page) => page.slug === slug) || membershipPages[0];
  const defaultValues = membershipPageInitialValuesBySlug[slug];
  const needsPdf = pageConfig.needsPdf;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [memberTypeOptions, setMemberTypeOptions] = useState<MembershipTypeOption[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: defaultValues,
    validationSchema: membershipPageSchema,
    enableReinitialize: true,
    onSubmit: async (formValues: MembershipPageValues, helpers: FormikHelpers<MembershipPageValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put(`/membershipPages/${slug}`, payload)
        : await post(`/membershipPages/${slug}`, payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Membership page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save membership page");
      }
      setUpdating(false);
    },
  });

  const keywordsString = useMemo(() => values.seo.keywords.filter(Boolean).join(", "), [values.seo.keywords]);

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: ApiBody, fallback?: MembershipPageValues) {
    const nextValues = normalizeValues(mergeValues(defaultValues, body ? stripApiFields(body) : fallback));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  function handleSelectMemberType(index: number, title: string) {
    const selectedType = memberTypeOptions.find((option) => option.title === title);
    void setFieldValue(`cardsSection.cards.${index}.title`, title);
    void setFieldValue(`cardsSection.cards.${index}.image`, selectedType?.image || "");
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get(`/membershipPages/${slug}`, true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        const nextValues = normalizeValues(mergeValues(defaultValues, stripApiFields(apiResponse.body as ApiBody)));
        setValues(nextValues);
        setHasExistingData(true);
      } else {
        setValues(defaultValues);
        setHasExistingData(false);
      }
      setLoading(false);
    }
    fetchPage();
  }, [defaultValues, setValues, slug]);

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

  useEffect(() => {
    async function fetchMemberTypes() {
      if (!needsPdf) {
        setMemberTypeOptions([]);
        return;
      }

      const apiResponse = await get("/membershipPages/types-of-membership?status=true", true);
      if (apiResponse?.status === 200 && apiResponse.body?.cardsSection?.cards) {
        setMemberTypeOptions(
          apiResponse.body.cardsSection.cards
            .filter((card: MembershipTypeOption) => card.title)
            .map((card: MembershipTypeOption) => ({
              title: card.title,
              image: card.image || "",
              status: card.status,
            })),
        );
      } else {
        setMemberTypeOptions(defaultValues.cardsSection.cards.map((card) => ({ title: card.title, image: card.image })));
      }
    }
    fetchMemberTypes();
  }, [defaultValues.cardsSection.cards, needsPdf]);

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return toast.error("Please select at least one file.");
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
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
        toast.success(apiData.message || "File uploaded successfully");
      } else toast.error(apiData.message || "Unable to upload file");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload file");
    }
    event.target.value = "";
  }

  function renderMediaThumb(filename: string) {
    const mediaUrl = addUrlToFile(filename);
    if (getMediaType(mediaUrl) === "image") return <img src={mediaUrl} alt={filename} />;
    return (
      <div className="media-library-file py-4">
        <i className="fa fa-file"></i>
        <small className="d-block mt-2 text-truncate">{filename}</small>
      </div>
    );
  }

  function handleAddCard() {
    const nextIndex = values.cardsSection.cards.length;
    const firstType = memberTypeOptions[0];
    const nextCard = createEmptyMembershipCard(nextIndex + 1, needsPdf);
    if (needsPdf && firstType) {
      nextCard.title = firstType.title;
      nextCard.image = firstType.image;
    }
    void setFieldValue("cardsSection.cards", [
      ...values.cardsSection.cards,
      nextCard,
    ]);
  }

  function handleRemoveCard(index: number) {
    void setFieldValue(
      "cardsSection.cards",
      values.cardsSection.cards.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  return (
    <div className="content-wrapper about-page-admin membership-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Members</span>
          </div>
          <h1>{pageConfig.label}</h1>
          <p>Manage banner, intro card, membership cards, PDF downloads, and SEO.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow={pageConfig.eyebrow} title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input className="form-control" name="bannerSection.title" onBlur={handleBlur} onChange={handleChange} placeholder="Become" value={values.bannerSection.title} />
                    <input className="form-control" name="bannerSection.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="A Member" value={values.bannerSection.highlightedTitle} />
                  </div>
                  <div className="about-page-image-field is-wide">
                    <button className="about-page-image-picker" data-bs-target="#selectMembershipPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("bannerSection.image")} type="button">
                      <img src={values.bannerSection.image ? addUrlToFile(values.bannerSection.image) : "/images/select-photo.png"} alt="Membership banner" />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Content" title="Intro Section" />
                <div className="form-group">
                  <TextareaBox label="Paragraphs" name="introSection.paragraphs" handleBlur={() => {}} handleChange={(event) => {
                    void setFieldValue("introSection.paragraphs", event.target.value.split("\n"));
                  }} placeholder="One paragraph per line" value={values.introSection.paragraphs.join("\n")} touched={false} error={undefined} />
                </div>
                <div className="form-group mb-0">
                  <label>Highlighted Text</label>
                  <input className="form-control" name="introSection.highlightedText" onBlur={handleBlur} onChange={handleChange} placeholder="Highlighted line" value={values.introSection.highlightedText} />
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="industry-editor-list__head">
                  <SectionHeading eyebrow="Cards" title="Membership Cards" />
                  <button className="report-add-button" onClick={handleAddCard} type="button">
                    <i className="fa fa-plus"></i>
                    <span>Add Card</span>
                  </button>
                </div>
                <div className="membership-card-admin-grid">
                  {values.cardsSection.cards.map((card, index) => (
                    <article className="membership-card-admin" key={index}>
                      <div className="membership-card-admin__actions">
                        <button aria-label="Remove card" onClick={() => handleRemoveCard(index)} type="button">
                          <i className="fa fa-times"></i>
                        </button>
                      </div>
                      {needsPdf ? (
                        <div className="form-group mb-0">
                          <label>Member Type</label>
                          <select className="form-control" onChange={(event) => handleSelectMemberType(index, event.target.value)} value={card.title}>
                            <option value="">Select member type</option>
                            {memberTypeOptions.map((option) => (
                              <option key={option.title} value={option.title}>{option.title}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <input className="form-control" name={`cardsSection.cards.${index}.title`} onBlur={handleBlur} onChange={handleChange} placeholder="Primary Members" value={card.title} />
                      )}
                      {needsPdf ? (
                        <div className="membership-card-admin__image is-preview">
                          {card.image ? <img src={addUrlToFile(card.image)} alt={card.title || "Membership card"} /> : <span>Select a member type to show image</span>}
                        </div>
                      ) : (
                        <button className="membership-card-admin__image" data-bs-target="#selectMembershipPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor(`cardsSection.cards.${index}.image`)} type="button">
                          {card.image ? <img src={addUrlToFile(card.image)} alt={card.title || "Membership card"} /> : <span>Select card image</span>}
                        </button>
                      )}
                      {needsPdf ? (
                        <>
                          <input className="form-control" name={`cardsSection.cards.${index}.buttonText`} onBlur={handleBlur} onChange={handleChange} placeholder="Download button text" value={card.buttonText} />
                          <button className="btn btn-light border w-100" data-bs-target="#selectMembershipPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor(`cardsSection.cards.${index}.pdfFile`)} type="button">
                            {card.pdfFile ? "Change PDF" : "Select PDF"}
                          </button>
                          {card.pdfFile ? (
                            <a className="report-file-link" href={addUrlToFile(card.pdfFile)} rel="noreferrer" target="_blank">
                              <i className="fa fa-file-pdf"></i>
                              <span>{card.pdfFile}</span>
                            </a>
                          ) : null}
                        </>
                      ) : null}
                      <div className="row">
                        <div className="form-group col-md-6 mb-0">
                          <label>Sort</label>
                          <input className="form-control" name={`cardsSection.cards.${index}.sortOrder`} onBlur={handleBlur} onChange={handleChange} type="number" value={card.sortOrder} />
                        </div>
                        <div className="form-group col-md-6 mb-0">
                          <label className="report-toggle mt-4">
                            <input checked={card.status} name={`cardsSection.cards.${index}.status`} onChange={(event) => setFieldValue(`cardsSection.cards.${index}.status`, event.target.checked)} type="checkbox" />
                            <span>Active</span>
                          </label>
                        </div>
                      </div>
                    </article>
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
              <div><strong>{pageConfig.label}</strong><span>Save membership page content.</span></div>
              <SubmitButton loading={updating} text="Update Page" />
            </div>
          </main>
        </div>
      </form>

      <div className="modal fade" id="selectMembershipPageMediaModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectMembershipPageMediaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectMembershipPageMediaModalLabel">Select Media</h1>
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
                      {renderMediaThumb(item.filename)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-3"><Pagination pagination={pagination} setPagination={setPagination} tableName="table-to-xls" csvFileName="media" /></div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary px-3 py-2" data-bs-dismiss="modal">Close</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
