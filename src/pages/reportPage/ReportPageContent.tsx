import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";
import {
  ReportPageValues,
  createEmptyReport,
  reportPageInitialValues,
  reportPageSchema,
} from "../../validationSchemas/reportPageSchema";

type ApiBody = Partial<ReportPageValues> & {
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

function stripApiFields(data: ApiBody): Partial<ReportPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: ReportPageValues): ReportPageValues {
  return {
    ...values,
    reportsSection: {
      ...values.reportsSection,
      reports: values.reportsSection.reports
        .map((report, index) => ({
          title: report.title.trim(),
          year: report.year.trim(),
          coverImage: report.coverImage.trim(),
          file: report.file.trim(),
          externalUrl: report.externalUrl.trim(),
          sortOrder: Number.isFinite(Number(report.sortOrder)) ? Number(report.sortOrder) : index,
          status: Boolean(report.status),
        }))
        .filter((report) => report.title || report.coverImage || report.file || report.externalUrl)
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

export function ReportPageContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeReportIndex, setActiveReportIndex] = useState<number | null>(null);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: reportPageInitialValues,
    validationSchema: reportPageSchema,
    onSubmit: async (formValues: ReportPageValues, helpers: FormikHelpers<ReportPageValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/reportPage", payload)
        : await post("/reportPage", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Report page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save report page");
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

  function syncSavedValues(body?: ApiBody, fallback?: ReportPageValues) {
    const nextValues = normalizeValues(mergeValues(reportPageInitialValues, body ? stripApiFields(body) : fallback));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get("/reportPage", true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        syncSavedValues(apiResponse.body as ApiBody);
        setHasExistingData(true);
      } else {
        setValues(reportPageInitialValues);
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

  function handleAddReport() {
    const nextIndex = values.reportsSection.reports.length;
    void setFieldValue("reportsSection.reports", [
      ...values.reportsSection.reports,
      createEmptyReport(nextIndex + 1),
    ]);
    setActiveReportIndex(nextIndex);
  }

  function handleRemoveReport(index: number) {
    void setFieldValue(
      "reportsSection.reports",
      values.reportsSection.reports.filter((_, itemIndex) => itemIndex !== index),
    );
    if (activeReportIndex === index) setActiveReportIndex(null);
  }

  const activeReport = activeReportIndex === null ? null : values.reportsSection.reports[activeReportIndex];

  return (
    <div className="content-wrapper about-page-admin past-chairmen-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Pages</span>
          </div>
          <h1>Report Page</h1>
          <p>Manage annual report banner, report covers, PDF files, and SEO.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Reports" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input className="form-control" name="bannerSection.title" onBlur={handleBlur} onChange={handleChange} placeholder="Annual" value={values.bannerSection.title} />
                    <input className="form-control" name="bannerSection.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Reports" value={values.bannerSection.highlightedTitle} />
                  </div>
                  <div className="about-page-image-field is-wide">
                    {values.bannerSection.image ? (
                      <button aria-label="Clear banner image" className="about-page-image-clear" onClick={() => setFieldValue("bannerSection.image", "")} type="button">
                        <i className="fa fa-times"></i>
                      </button>
                    ) : null}
                    <button className="about-page-image-picker" data-bs-target="#selectReportPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("bannerSection.image")} type="button">
                      <img src={values.bannerSection.image ? addUrlToFile(values.bannerSection.image) : "/images/select-photo.png"} alt="Report banner" />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="industry-editor-list__head">
                  <SectionHeading eyebrow="Reports" title="Report Cards" />
                  <button className="report-add-button" onClick={handleAddReport} type="button">
                    <i className="fa fa-plus"></i>
                    <span>Add Report</span>
                  </button>
                </div>
                <input className="form-control mb-3" name="reportsSection.heading" onBlur={handleBlur} onChange={handleChange} placeholder="Annual Reports" value={values.reportsSection.heading} />
                <div className="report-admin-grid">
                  {values.reportsSection.reports.map((report, index) => (
                    <article className="report-admin-card" key={index}>
                      <div className="report-admin-card__actions">
                        <button aria-label="Edit report" onClick={() => setActiveReportIndex(index)} title="Edit report" type="button">
                          <i className="fa fa-pencil"></i>
                        </button>
                        <button aria-label="Remove report" onClick={() => handleRemoveReport(index)} title="Remove report" type="button">
                          <i className="fa fa-times"></i>
                        </button>
                      </div>
                      <button className="report-admin-card__cover" onClick={() => setActiveReportIndex(index)} type="button">
                        {report.coverImage ? (
                          <img src={addUrlToFile(report.coverImage)} alt={report.title || "Report thumbnail"} />
                        ) : (
                          <span>Select thumbnail</span>
                        )}
                        {report.year ? <strong>{report.year}</strong> : null}
                      </button>
                      <span className={`report-admin-status ${report.status ? "is-active" : ""}`}>
                        {report.status ? "Active" : "Hidden"}
                      </span>
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
              <div><strong>Report Page</strong><span>Save annual reports content.</span></div>
              <SubmitButton loading={updating} text="Update Reports" />
            </div>
          </main>
        </div>
      </form>

      <div className={`report-offcanvas-backdrop ${activeReport ? "is-open" : ""}`} onClick={() => setActiveReportIndex(null)} />
      <aside className={`report-offcanvas ${activeReport ? "is-open" : ""}`} aria-hidden={!activeReport}>
        <div className="report-offcanvas__header">
          <div>
            <span>Report</span>
            <h2>{activeReportIndex === null ? "Add Report" : "Edit Report"}</h2>
          </div>
          <button aria-label="Close report editor" onClick={() => setActiveReportIndex(null)} type="button">
            <i className="fa fa-times"></i>
          </button>
        </div>
        {activeReport && activeReportIndex !== null ? (
          <div className="report-offcanvas__body">
            <div className="form-group">
              <label>Thumbnail Image</label>
              <button className="report-thumbnail-picker" data-bs-target="#selectReportPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor(`reportsSection.reports.${activeReportIndex}.coverImage`)} type="button">
                {activeReport.coverImage ? (
                  <img src={addUrlToFile(activeReport.coverImage)} alt="Report thumbnail" />
                ) : (
                  <span>Select thumbnail</span>
                )}
              </button>
            </div>
            <div className="form-group">
              <label>PDF File</label>
              <button className="btn btn-light border w-100" data-bs-target="#selectReportPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor(`reportsSection.reports.${activeReportIndex}.file`)} type="button">
                {activeReport.file ? "Change PDF File" : "Select PDF File"}
              </button>
              {activeReport.file ? (
                <a className="report-file-link" href={addUrlToFile(activeReport.file)} rel="noreferrer" target="_blank">
                  <i className="fa fa-file-pdf"></i>
                  <span>{activeReport.file}</span>
                </a>
              ) : null}
            </div>
            <div className="form-group">
              <label>Title</label>
              <input className="form-control" name={`reportsSection.reports.${activeReportIndex}.title`} onBlur={handleBlur} onChange={handleChange} placeholder="Annual Report 2022" value={activeReport.title} />
            </div>
            <div className="row">
              <div className="form-group col-md-6">
                <label>Year</label>
                <input className="form-control" name={`reportsSection.reports.${activeReportIndex}.year`} onBlur={handleBlur} onChange={handleChange} placeholder="2022" value={activeReport.year} />
              </div>
              <div className="form-group col-md-6">
                <label>Sort Order</label>
                <input className="form-control" name={`reportsSection.reports.${activeReportIndex}.sortOrder`} onBlur={handleBlur} onChange={handleChange} placeholder="1" type="number" value={activeReport.sortOrder} />
              </div>
            </div>
            <div className="form-group">
              <label>External URL</label>
              <input className="form-control" name={`reportsSection.reports.${activeReportIndex}.externalUrl`} onBlur={handleBlur} onChange={handleChange} placeholder="Optional external URL" value={activeReport.externalUrl} />
            </div>
            <label className="report-toggle">
              <input checked={activeReport.status} name={`reportsSection.reports.${activeReportIndex}.status`} onChange={(event) => setFieldValue(`reportsSection.reports.${activeReportIndex}.status`, event.target.checked)} type="checkbox" />
              <span>Active</span>
            </label>
          </div>
        ) : null}
        <div className="report-offcanvas__footer">
          <button className="btn btn-light border" onClick={() => setActiveReportIndex(null)} type="button">Done</button>
        </div>
      </aside>

      <div className="modal fade" id="selectReportPageMediaModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectReportPageMediaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectReportPageMediaModalLabel">Select Media</h1>
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
