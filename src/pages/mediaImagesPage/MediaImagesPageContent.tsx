import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";
import {
  MediaImagesPageValues,
  createEmptyMediaImage,
  mediaImagesPageInitialValues,
  mediaImagesPageSchema,
} from "../../validationSchemas/mediaImagesPageSchema";

type ApiBody = Partial<MediaImagesPageValues> & {
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

function stripApiFields(data: ApiBody): Partial<MediaImagesPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: MediaImagesPageValues): MediaImagesPageValues {
  return {
    ...values,
    imagesSection: {
      ...values.imagesSection,
      images: values.imagesSection.images
        .map((image, index) => ({
          title: image.title.trim(),
          image: image.image.trim(),
          sortOrder: Number.isFinite(Number(image.sortOrder)) ? Number(image.sortOrder) : index,
          status: Boolean(image.status),
        }))
        .filter((image) => image.title || image.image)
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

export function MediaImagesPageContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: mediaImagesPageInitialValues,
    validationSchema: mediaImagesPageSchema,
    onSubmit: async (formValues: MediaImagesPageValues, helpers: FormikHelpers<MediaImagesPageValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/mediaImagesPage", payload)
        : await post("/mediaImagesPage", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Media images page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save media images page");
      }
      setUpdating(false);
    },
  });

  const keywordsString = useMemo(() => values.seo.keywords.filter((keyword) => keyword.trim()).join(", "), [values.seo.keywords]);
  const activeImage = activeImageIndex === null ? null : values.imagesSection.images[activeImageIndex];

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: ApiBody, fallback?: MediaImagesPageValues) {
    const nextValues = normalizeValues(mergeValues(mediaImagesPageInitialValues, body ? stripApiFields(body) : fallback));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get("/mediaImagesPage", true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        syncSavedValues(apiResponse.body as ApiBody);
        setHasExistingData(true);
      } else {
        setValues(mediaImagesPageInitialValues);
        setHasExistingData(false);
      }
      setLoading(false);
    }
    fetchPage();
  }, [setValues]);

  useEffect(() => {
    async function fetchMedia() {
      let url = `/media?page=${pagination.page}&limit=${pagination.limit}&fileType=IMAGE`;
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

  function handleAddImage() {
    const nextIndex = values.imagesSection.images.length;
    void setFieldValue("imagesSection.images", [
      ...values.imagesSection.images,
      createEmptyMediaImage(nextIndex + 1),
    ]);
    setActiveImageIndex(nextIndex);
  }

  function handleRemoveImage(index: number) {
    void setFieldValue(
      "imagesSection.images",
      values.imagesSection.images.filter((_, itemIndex) => itemIndex !== index),
    );
    if (activeImageIndex === index) setActiveImageIndex(null);
  }

  return (
    <div className="content-wrapper about-page-admin media-images-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Media</span>
          </div>
          <h1>Media Images Page</h1>
          <p>Manage media images banner, gallery cards, and SEO.</p>
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
                    <input className="form-control" name="bannerSection.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Images" value={values.bannerSection.highlightedTitle} />
                  </div>
                  <div className="about-page-image-field is-wide">
                    <button className="about-page-image-picker" data-bs-target="#selectMediaImagesPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("bannerSection.image")} type="button">
                      <img src={values.bannerSection.image ? addUrlToFile(values.bannerSection.image) : "/images/select-photo.png"} alt="Media images banner" />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="industry-editor-list__head">
                  <SectionHeading eyebrow="Gallery" title="Image Cards" />
                  <button className="report-add-button" onClick={handleAddImage} type="button">
                    <i className="fa fa-plus"></i>
                    <span>Add Image</span>
                  </button>
                </div>
                <input className="form-control mb-3" name="imagesSection.heading" onBlur={handleBlur} onChange={handleChange} placeholder="Media Images" value={values.imagesSection.heading} />
                <div className="media-images-admin-grid">
                  {values.imagesSection.images.map((image, index) => (
                    <article className="media-image-admin-card" key={index}>
                      <div className="report-admin-card__actions">
                        <button aria-label="Edit image" onClick={() => setActiveImageIndex(index)} type="button"><i className="fa fa-pencil"></i></button>
                        <button aria-label="Remove image" onClick={() => handleRemoveImage(index)} type="button"><i className="fa fa-times"></i></button>
                      </div>
                      <button className="media-image-admin-card__image" onClick={() => setActiveImageIndex(index)} type="button">
                        {image.image ? <img src={addUrlToFile(image.image)} alt={image.title || "Media"} /> : <span>Select image</span>}
                      </button>
                      <p>{image.title || "Untitled image"}</p>
                      <span className={`report-admin-status ${image.status ? "is-active" : ""}`}>
                        {image.status ? "Active" : "Hidden"}
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
              <div><strong>Media Images Page</strong><span>Save media images content.</span></div>
              <SubmitButton loading={updating} text="Update Images" />
            </div>
          </main>
        </div>
      </form>

      <div className={`report-offcanvas-backdrop ${activeImage ? "is-open" : ""}`} onClick={() => setActiveImageIndex(null)} />
      <aside className={`report-offcanvas ${activeImage ? "is-open" : ""}`} aria-hidden={!activeImage}>
        <div className="report-offcanvas__header">
          <div>
            <span>Media Image</span>
            <h2>{activeImageIndex === null ? "Add Image" : "Edit Image"}</h2>
          </div>
          <button aria-label="Close image editor" onClick={() => setActiveImageIndex(null)} type="button"><i className="fa fa-times"></i></button>
        </div>
        {activeImage && activeImageIndex !== null ? (
          <div className="report-offcanvas__body">
            <div className="form-group">
              <label>Image</label>
              <button className="report-thumbnail-picker" data-bs-target="#selectMediaImagesPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor(`imagesSection.images.${activeImageIndex}.image`)} type="button">
                {activeImage.image ? <img src={addUrlToFile(activeImage.image)} alt="Media" /> : <span>Select image</span>}
              </button>
            </div>
            <div className="form-group">
              <TextareaBox label="Caption" name={`imagesSection.images.${activeImageIndex}.title`} handleBlur={handleBlur} handleChange={handleChange} placeholder="Image caption" value={activeImage.title} touched={getTouched(`imagesSection.images.${activeImageIndex}.title`)} error={getError(`imagesSection.images.${activeImageIndex}.title`)} />
            </div>
            <div className="form-group">
              <label>Sort Order</label>
              <input className="form-control" name={`imagesSection.images.${activeImageIndex}.sortOrder`} onBlur={handleBlur} onChange={handleChange} placeholder="1" type="number" value={activeImage.sortOrder} />
            </div>
            <label className="report-toggle">
              <input checked={activeImage.status} name={`imagesSection.images.${activeImageIndex}.status`} onChange={(event) => setFieldValue(`imagesSection.images.${activeImageIndex}.status`, event.target.checked)} type="checkbox" />
              <span>Active</span>
            </label>
          </div>
        ) : null}
        <div className="report-offcanvas__footer">
          <button className="btn btn-light border" onClick={() => setActiveImageIndex(null)} type="button">Done</button>
        </div>
      </aside>

      <div className="modal fade" id="selectMediaImagesPageMediaModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectMediaImagesPageMediaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectMediaImagesPageMediaModalLabel">Select Image</h1>
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
