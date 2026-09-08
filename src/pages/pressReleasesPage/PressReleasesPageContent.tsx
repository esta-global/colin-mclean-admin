import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";
import {
  PressReleasesPageValues,
  createEmptyPressRelease,
  pressReleasesPageInitialValues,
  pressReleasesPageSchema,
} from "../../validationSchemas/pressReleasesPageSchema";

type ApiBody = Partial<PressReleasesPageValues> & {
  _id?: string;
  __v?: number;
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

function stripApiFields(data: ApiBody): Partial<PressReleasesPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: PressReleasesPageValues): PressReleasesPageValues {
  return {
    ...values,
    releasesSection: {
      ...values.releasesSection,
      releases: values.releasesSection.releases
        .map((release, index) => ({
          date: release.date.trim(),
          title: release.title.trim(),
          file: release.file.trim(),
          externalUrl: release.externalUrl.trim(),
          sortOrder: Number.isFinite(Number(release.sortOrder)) ? Number(release.sortOrder) : index,
          status: Boolean(release.status),
        }))
        .filter((release) => release.date || release.title || release.file || release.externalUrl)
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

export function PressReleasesPageContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeReleaseIndex, setActiveReleaseIndex] = useState<number | null>(null);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: pressReleasesPageInitialValues,
    validationSchema: pressReleasesPageSchema,
    onSubmit: async (formValues: PressReleasesPageValues, helpers: FormikHelpers<PressReleasesPageValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/pressReleasesPage", payload)
        : await post("/pressReleasesPage", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Press releases page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save press releases page");
      }
      setUpdating(false);
    },
  });

  const keywordsString = useMemo(() => values.seo.keywords.filter((keyword) => keyword.trim()).join(", "), [values.seo.keywords]);
  const activeRelease = activeReleaseIndex === null ? null : values.releasesSection.releases[activeReleaseIndex];

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: ApiBody, fallback?: PressReleasesPageValues) {
    const nextValues = normalizeValues(mergeValues(pressReleasesPageInitialValues, body ? stripApiFields(body) : fallback));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get("/pressReleasesPage", true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        syncSavedValues(apiResponse.body as ApiBody);
        setHasExistingData(true);
      } else {
        setValues(pressReleasesPageInitialValues);
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

  function handleAddRelease() {
    const nextIndex = values.releasesSection.releases.length;
    void setFieldValue("releasesSection.releases", [
      ...values.releasesSection.releases,
      createEmptyPressRelease(nextIndex + 1),
    ]);
    setActiveReleaseIndex(nextIndex);
  }

  function handleRemoveRelease(index: number) {
    void setFieldValue(
      "releasesSection.releases",
      values.releasesSection.releases.filter((_, itemIndex) => itemIndex !== index),
    );
    if (activeReleaseIndex === index) setActiveReleaseIndex(null);
  }

  return (
    <div className="content-wrapper about-page-admin press-releases-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Media</span>
          </div>
          <h1>Press Releases Page</h1>
          <p>Manage media banner, press release cards, documents, and SEO.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Media" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input className="form-control" name="bannerSection.title" onBlur={handleBlur} onChange={handleChange} placeholder="Media" value={values.bannerSection.title} />
                    <input className="form-control" name="bannerSection.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Optional highlighted title" value={values.bannerSection.highlightedTitle} />
                  </div>
                  <div className="about-page-image-field is-wide">
                    <button className="about-page-image-picker" data-bs-target="#selectPressReleasesPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("bannerSection.image")} type="button">
                      <img src={values.bannerSection.image ? addUrlToFile(values.bannerSection.image) : "/images/select-photo.png"} alt="Press releases banner" />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="industry-editor-list__head">
                  <SectionHeading eyebrow="Media" title="Press Release Cards" />
                  <button className="report-add-button" onClick={handleAddRelease} type="button">
                    <i className="fa fa-plus"></i>
                    <span>Add Release</span>
                  </button>
                </div>
                <input className="form-control mb-3" name="releasesSection.heading" onBlur={handleBlur} onChange={handleChange} placeholder="Press Releases" value={values.releasesSection.heading} />
                <div className="press-release-admin-grid">
                  {values.releasesSection.releases.map((release, index) => (
                    <article className="press-release-admin-card" key={index}>
                      <div className="press-release-admin-card__top">
                        <span className={`report-admin-status ${release.status ? "is-active" : ""}`}>
                          {release.status ? "Active" : "Hidden"}
                        </span>
                        <div className="press-release-admin-card__actions">
                        <button aria-label="Edit release" onClick={() => setActiveReleaseIndex(index)} type="button"><i className="fa fa-pencil"></i></button>
                        <button aria-label="Remove release" onClick={() => handleRemoveRelease(index)} type="button"><i className="fa fa-times"></i></button>
                        </div>
                      </div>
                      <button className="press-release-admin-card__body" onClick={() => setActiveReleaseIndex(index)} type="button">
                        <span>{release.date || "Release date"}</span>
                        <strong>{release.title || "Untitled press release"}</strong>
                      </button>
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
              <div><strong>Press Releases Page</strong><span>Save press release content.</span></div>
              <SubmitButton loading={updating} text="Update Releases" />
            </div>
          </main>
        </div>
      </form>

      <div className={`report-offcanvas-backdrop ${activeRelease ? "is-open" : ""}`} onClick={() => setActiveReleaseIndex(null)} />
      <aside className={`report-offcanvas ${activeRelease ? "is-open" : ""}`} aria-hidden={!activeRelease}>
        <div className="report-offcanvas__header">
          <div>
            <span>Press Release</span>
            <h2>{activeReleaseIndex === null ? "Add Release" : "Edit Release"}</h2>
          </div>
          <button aria-label="Close release editor" onClick={() => setActiveReleaseIndex(null)} type="button"><i className="fa fa-times"></i></button>
        </div>
        {activeRelease && activeReleaseIndex !== null ? (
          <div className="report-offcanvas__body">
            <div className="form-group">
              <label>Date</label>
              <input className="form-control" name={`releasesSection.releases.${activeReleaseIndex}.date`} onBlur={handleBlur} onChange={handleChange} placeholder="August 25th, 2022" value={activeRelease.date} />
            </div>
            <div className="form-group">
              <TextareaBox label="Title" name={`releasesSection.releases.${activeReleaseIndex}.title`} handleBlur={handleBlur} handleChange={handleChange} placeholder="Press release title" value={activeRelease.title} touched={getTouched(`releasesSection.releases.${activeReleaseIndex}.title`)} error={getError(`releasesSection.releases.${activeReleaseIndex}.title`)} />
            </div>
            <div className="form-group">
              <label>PDF / Document File</label>
              <button className="btn btn-light border w-100" data-bs-target="#selectPressReleasesPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor(`releasesSection.releases.${activeReleaseIndex}.file`)} type="button">
                {activeRelease.file ? "Change File" : "Select File"}
              </button>
              {activeRelease.file ? (
                <a className="report-file-link" href={addUrlToFile(activeRelease.file)} rel="noreferrer" target="_blank">
                  <i className="fa fa-file"></i>
                  <span>{activeRelease.file}</span>
                </a>
              ) : null}
            </div>
            <div className="form-group">
              <label>External URL</label>
              <input className="form-control" name={`releasesSection.releases.${activeReleaseIndex}.externalUrl`} onBlur={handleBlur} onChange={handleChange} placeholder="Optional external URL" value={activeRelease.externalUrl} />
            </div>
            <div className="form-group">
              <label>Sort Order</label>
              <input className="form-control" name={`releasesSection.releases.${activeReleaseIndex}.sortOrder`} onBlur={handleBlur} onChange={handleChange} placeholder="1" type="number" value={activeRelease.sortOrder} />
            </div>
            <label className="report-toggle">
              <input checked={activeRelease.status} name={`releasesSection.releases.${activeReleaseIndex}.status`} onChange={(event) => setFieldValue(`releasesSection.releases.${activeReleaseIndex}.status`, event.target.checked)} type="checkbox" />
              <span>Active</span>
            </label>
          </div>
        ) : null}
        <div className="report-offcanvas__footer">
          <button className="btn btn-light border" onClick={() => setActiveReleaseIndex(null)} type="button">Done</button>
        </div>
      </aside>

      <div className="modal fade" id="selectPressReleasesPageMediaModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectPressReleasesPageMediaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectPressReleasesPageMediaModalLabel">Select Media</h1>
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
