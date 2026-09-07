import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";
import {
  VideoItem,
  VideosPageValues,
  createEmptyVideo,
  videosPageInitialValues,
  videosPageSchema,
} from "../../validationSchemas/videosPageSchema";

type ApiBody = Partial<VideosPageValues> & {
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

function stripApiFields(data: ApiBody): Partial<VideosPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: VideosPageValues): VideosPageValues {
  return {
    ...values,
    videosSection: {
      ...values.videosSection,
      videos: values.videosSection.videos
        .map((video, index) => ({
          title: video.title.trim(),
          videoUrl: video.videoUrl.trim(),
          sortOrder: Number.isFinite(Number(video.sortOrder)) ? Number(video.sortOrder) : index,
          status: Boolean(video.status),
        }))
        .filter((video) => video.title || video.videoUrl)
        .sort((first, second) => first.sortOrder - second.sortOrder),
    },
    seo: {
      ...values.seo,
      keywords: values.seo.keywords.filter((keyword) => keyword.trim()),
    },
  };
}

function getYoutubeEmbedUrl(url: string) {
  const value = url.trim();
  if (!value) return "";
  if (value.includes("/embed/")) return value;

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];
  const match = patterns.map((pattern) => value.match(pattern)?.[1]).find(Boolean);
  return match ? `https://www.youtube.com/embed/${match}` : value;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="about-page-section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

export function VideosPageContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: videosPageInitialValues,
    validationSchema: videosPageSchema,
    onSubmit: async (formValues: VideosPageValues, helpers: FormikHelpers<VideosPageValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/videosPage", payload)
        : await post("/videosPage", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Videos page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save videos page");
      }
      setUpdating(false);
    },
  });

  const keywordsString = useMemo(() => values.seo.keywords.filter((keyword) => keyword.trim()).join(", "), [values.seo.keywords]);
  const activeVideo: VideoItem | null = activeVideoIndex === null ? null : values.videosSection.videos[activeVideoIndex];

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: ApiBody, fallback?: VideosPageValues) {
    const nextValues = normalizeValues(mergeValues(videosPageInitialValues, body ? stripApiFields(body) : fallback));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get("/videosPage", true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        syncSavedValues(apiResponse.body as ApiBody);
        setHasExistingData(true);
      } else {
        setValues(videosPageInitialValues);
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

  function handleAddVideo() {
    const nextIndex = values.videosSection.videos.length;
    void setFieldValue("videosSection.videos", [
      ...values.videosSection.videos,
      createEmptyVideo(nextIndex + 1),
    ]);
    setActiveVideoIndex(nextIndex);
  }

  function handleRemoveVideo(index: number) {
    void setFieldValue(
      "videosSection.videos",
      values.videosSection.videos.filter((_, itemIndex) => itemIndex !== index),
    );
    if (activeVideoIndex === index) setActiveVideoIndex(null);
  }

  return (
    <div className="content-wrapper about-page-admin videos-page-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Media</span>
          </div>
          <h1>Videos Page</h1>
          <p>Manage videos banner, YouTube cards, visibility, and SEO.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Videos" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input className="form-control" name="bannerSection.title" onBlur={handleBlur} onChange={handleChange} placeholder="Trivia" value={values.bannerSection.title} />
                    <input className="form-control" name="bannerSection.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Videos" value={values.bannerSection.highlightedTitle} />
                  </div>
                  <div className="about-page-image-field is-wide">
                    <button className="about-page-image-picker" data-bs-target="#selectVideosPageMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("bannerSection.image")} type="button">
                      <img src={values.bannerSection.image ? addUrlToFile(values.bannerSection.image) : "/images/select-photo.png"} alt="Videos banner" />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="industry-editor-list__head">
                  <SectionHeading eyebrow="Videos" title="Video Cards" />
                  <button className="report-add-button" onClick={handleAddVideo} type="button">
                    <i className="fa fa-plus"></i>
                    <span>Add Video</span>
                  </button>
                </div>
                <input className="form-control mb-3" name="videosSection.heading" onBlur={handleBlur} onChange={handleChange} placeholder="Videos" value={values.videosSection.heading} />
                <div className="videos-admin-grid">
                  {values.videosSection.videos.map((video, index) => {
                    const embedUrl = getYoutubeEmbedUrl(video.videoUrl);
                    return (
                      <article className="video-admin-card" key={index}>
                        <div className="report-admin-card__actions">
                          <button aria-label="Edit video" onClick={() => setActiveVideoIndex(index)} type="button"><i className="fa fa-pencil"></i></button>
                          <button aria-label="Remove video" onClick={() => handleRemoveVideo(index)} type="button"><i className="fa fa-times"></i></button>
                        </div>
                        <button className="video-admin-card__preview" onClick={() => setActiveVideoIndex(index)} type="button">
                          {embedUrl ? (
                            <iframe src={embedUrl} title={video.title || "Video preview"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                          ) : (
                            <span><i className="fa fa-play"></i> Add YouTube URL</span>
                          )}
                        </button>
                        <p>{video.title || "Untitled video"}</p>
                        <span className={`report-admin-status ${video.status ? "is-active" : ""}`}>
                          {video.status ? "Active" : "Hidden"}
                        </span>
                      </article>
                    );
                  })}
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
              <div><strong>Videos Page</strong><span>Save videos page content.</span></div>
              <SubmitButton loading={updating} text="Update Videos" />
            </div>
          </main>
        </div>
      </form>

      <div className={`report-offcanvas-backdrop ${activeVideo ? "is-open" : ""}`} onClick={() => setActiveVideoIndex(null)} />
      <aside className={`report-offcanvas ${activeVideo ? "is-open" : ""}`} aria-hidden={!activeVideo}>
        <div className="report-offcanvas__header">
          <div>
            <span>Video</span>
            <h2>{activeVideoIndex === null ? "Add Video" : "Edit Video"}</h2>
          </div>
          <button aria-label="Close video editor" onClick={() => setActiveVideoIndex(null)} type="button"><i className="fa fa-times"></i></button>
        </div>
        {activeVideo && activeVideoIndex !== null ? (
          <div className="report-offcanvas__body">
            <div className="form-group">
              <label>Video Title</label>
              <input className="form-control" name={`videosSection.videos.${activeVideoIndex}.title`} onBlur={handleBlur} onChange={handleChange} placeholder="Video title" value={activeVideo.title} />
            </div>
            <div className="form-group">
              <label>YouTube URL</label>
              <input className="form-control" name={`videosSection.videos.${activeVideoIndex}.videoUrl`} onBlur={handleBlur} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." value={activeVideo.videoUrl} />
            </div>
            {activeVideo.videoUrl ? (
              <div className="video-offcanvas-preview">
                <iframe src={getYoutubeEmbedUrl(activeVideo.videoUrl)} title={activeVideo.title || "Video preview"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : null}
            <div className="form-group">
              <label>Sort Order</label>
              <input className="form-control" name={`videosSection.videos.${activeVideoIndex}.sortOrder`} onBlur={handleBlur} onChange={handleChange} placeholder="1" type="number" value={activeVideo.sortOrder} />
            </div>
            <label className="report-toggle">
              <input checked={activeVideo.status} name={`videosSection.videos.${activeVideoIndex}.status`} onChange={(event) => setFieldValue(`videosSection.videos.${activeVideoIndex}.status`, event.target.checked)} type="checkbox" />
              <span>Active</span>
            </label>
          </div>
        ) : null}
        <div className="report-offcanvas__footer">
          <button className="btn btn-light border" onClick={() => setActiveVideoIndex(null)} type="button">Done</button>
        </div>
      </aside>

      <div className="modal fade" id="selectVideosPageMediaModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectVideosPageMediaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectVideosPageMediaModalLabel">Select Image</h1>
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
