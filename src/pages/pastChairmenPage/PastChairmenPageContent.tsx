import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  GoBackButton,
  OverlayLoading,
  Pagination,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile } from "../../utills/addUrlToFile";
import {
  PastChairman,
  PastChairmenPageValues,
  createEmptyPastChairman,
  pastChairmenPageInitialValues,
  pastChairmenPageSchema,
} from "../../validationSchemas/pastChairmenPageSchema";

type PastChairmenPageApiBody = Partial<PastChairmenPageValues> & {
  _id?: string;
  __v?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MediaRecord = {
  _id?: string;
  filename: string;
};

type DrawerMode = "add" | "edit";

type ChairmanFormErrors = Partial<Record<"name" | "tenure" | "company", string>>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergePastChairmenValues<T>(initial: T, incoming: unknown): T {
  if (Array.isArray(initial)) return (Array.isArray(incoming) ? incoming : initial) as T;

  if (isPlainObject(initial)) {
    const source = isPlainObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};
    Object.keys(initial).forEach((key) => {
      result[key] = mergePastChairmenValues(initial[key], source[key]);
    });
    return result as T;
  }

  return (incoming === undefined || incoming === null ? initial : incoming) as T;
}

function stripApiFields(data: PastChairmenPageApiBody): Partial<PastChairmenPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizePastChairmenValues(values: PastChairmenPageValues): PastChairmenPageValues {
  return {
    ...values,
    introSection: {
      ...values.introSection,
      eyebrow: values.introSection.eyebrow.trim(),
      title: values.introSection.title.trim(),
      highlightedTitle: values.introSection.highlightedTitle.trim(),
      text: values.introSection.text.trim(),
      paragraphs: values.introSection.paragraphs
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      highlightText: values.introSection.highlightText.trim(),
    },
    chairmenSection: {
      ...values.chairmenSection,
      heading: values.chairmenSection.heading.trim(),
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

function PastChairmanDrawer({
  draft,
  errors,
  mode,
  open,
  saving,
  onChange,
  onClose,
  onPickImage,
  onSave,
}: {
  draft: PastChairman;
  errors: ChairmanFormErrors;
  mode: DrawerMode;
  open: boolean;
  saving: boolean;
  onChange: (field: keyof PastChairman, value: string) => void;
  onClose: () => void;
  onPickImage: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <div className={`executive-drawer-backdrop ${open ? "is-open" : ""}`} onClick={onClose}></div>
      <aside className={`executive-member-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="executive-member-drawer__header">
          <div>
            <span>Past Chairmen</span>
            <h2>{mode === "add" ? "Add Past Chairman" : "Edit Past Chairman"}</h2>
          </div>
          <button aria-label="Close drawer" disabled={saving} onClick={onClose} type="button">
            <i className="fa fa-times"></i>
          </button>
        </div>
        <div className="executive-member-drawer__body">
          <div className="executive-form-field">
            <label>Profile Photo</label>
            <button
              className="executive-avatar-upload"
              data-bs-target="#selectPastChairmenImageFileModal"
              data-bs-toggle="modal"
              onClick={onPickImage}
              type="button"
            >
              <span className="executive-member-avatar">
                {draft.image ? (
                  <img src={addUrlToFile(draft.image)} alt={draft.name || "Past chairman"} />
                ) : (
                  <i className="fa fa-user"></i>
                )}
              </span>
              <strong>{draft.image ? "Change photo" : "Select photo"}</strong>
            </button>
          </div>
          <div className="executive-form-field">
            <label>Full Name</label>
            <input
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Full name"
              value={draft.name}
            />
            {errors.name ? <small>{errors.name}</small> : null}
          </div>
          <div className="executive-form-field">
            <label>Tenure</label>
            <input
              className={`form-control ${errors.tenure ? "is-invalid" : ""}`}
              onChange={(event) => onChange("tenure", event.target.value)}
              placeholder="e.g. 2022-2024"
              value={draft.tenure}
            />
            {errors.tenure ? <small>{errors.tenure}</small> : null}
          </div>
          <div className="executive-form-field">
            <label>Company</label>
            <input
              className={`form-control ${errors.company ? "is-invalid" : ""}`}
              onChange={(event) => onChange("company", event.target.value)}
              placeholder="Company"
              value={draft.company}
            />
            {errors.company ? <small>{errors.company}</small> : null}
          </div>
        </div>
        <div className="executive-member-drawer__footer">
          <button disabled={saving} onClick={onClose} type="button">
            Cancel
          </button>
          <button disabled={saving} onClick={onSave} type="button">
            {saving ? "Saving..." : mode === "add" ? "Save Chairman" : "Update Chairman"}
          </button>
        </div>
      </aside>
    </>
  );
}

function DeleteChairmanModal({
  deleting,
  chairman,
  onCancel,
  onConfirm,
}: {
  deleting: boolean;
  chairman: { index: number; data: PastChairman } | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return chairman ? (
    <div className="executive-delete-modal-shell">
      <div className="executive-delete-modal-backdrop" />
      <div className="executive-delete-modal" role="dialog" aria-modal="true">
        <div className="executive-delete-modal__icon">
          <i className="fa fa-trash"></i>
        </div>
        <h2>Delete Chairman</h2>
        <p>Are you sure you want to delete this chairman? This action cannot be undone.</p>
        <strong>{chairman.data.name || "Selected chairman"}</strong>
        <div>
          <button disabled={deleting} onClick={onCancel} type="button">
            Cancel
          </button>
          <button disabled={deleting} onClick={onConfirm} type="button">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

function PastChairmenTable({
  chairmen,
  loading,
  page,
  rowsPerPage,
  totalChairmen,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
}: {
  chairmen: PastChairman[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalChairmen: number;
  onEdit: (visibleIndex: number) => void;
  onDelete: (visibleIndex: number) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (value: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalChairmen / rowsPerPage));
  const start = totalChairmen === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalChairmen);
  const pageItems = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - page) <= 1,
  );
  const paginationItems = pageItems.reduce<(number | "...")[]>((items, pageNumber) => {
    const previous = items[items.length - 1];
    if (typeof previous === "number" && pageNumber - previous > 1) items.push("...");
    items.push(pageNumber);
    return items;
  }, []);

  return (
    <div className="executive-table-card">
      <div className="executive-table-scroll">
        <table className="executive-members-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Full Name</th>
              <th>Tenure</th>
              <th>Company</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <div className="executive-table-state">Loading chairmen...</div>
                </td>
              </tr>
            ) : chairmen.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="executive-table-state">
                    <i className="fa fa-users"></i>
                    <span>No chairmen found</span>
                  </div>
                </td>
              </tr>
            ) : (
              chairmen.map((chairman, index) => (
                <tr key={`${chairman.name}-${index}`}>
                  <td>
                    <div className="executive-table-avatar">
                      {chairman.image ? (
                        <img src={addUrlToFile(chairman.image)} alt={chairman.name} />
                      ) : (
                        <i className="fa fa-user"></i>
                      )}
                    </div>
                  </td>
                  <td><strong>{chairman.name || "-"}</strong></td>
                  <td>{chairman.tenure || "-"}</td>
                  <td>{chairman.company || "-"}</td>
                  <td>
                    <div className="executive-table-actions">
                      <button
                        aria-label={`Edit ${chairman.name || "chairman"}`}
                        title="Edit"
                        onClick={() => onEdit(index)}
                        type="button"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                      <button
                        aria-label={`Delete ${chairman.name || "chairman"}`}
                        title="Delete"
                        onClick={() => onDelete(index)}
                        type="button"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="executive-table-footer">
        <span>Showing {start}-{end} of {totalChairmen}</span>
        <div>
          <label>
            Rows per page
            <select onChange={(event) => onRowsPerPageChange(Number(event.target.value))} value={rowsPerPage}>
              <option value={7}>7</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">
            Previous
          </button>
          <div className="executive-pagination-pages" aria-label="Pagination pages">
            {paginationItems.map((item, index) =>
              item === "..." ? (
                <span key={`dots-${index}`}>...</span>
              ) : (
                <button
                  aria-current={item === page ? "page" : undefined}
                  className={item === page ? "is-active" : ""}
                  disabled={item === page}
                  key={item}
                  onClick={() => onPageChange(item)}
                  type="button"
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} type="button">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function PastChairmenPageContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [editingChairmanIndex, setEditingChairmanIndex] = useState<number | null>(null);
  const [chairmanDraft, setChairmanDraft] = useState<PastChairman>(createEmptyPastChairman());
  const [chairmanErrors, setChairmanErrors] = useState<ChairmanFormErrors>({});
  const [savingChairman, setSavingChairman] = useState(false);
  const [chairmanSearch, setChairmanSearch] = useState("");
  const [chairmenPage, setChairmenPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [chairmanToDelete, setChairmanToDelete] = useState<{
    index: number;
    data: PastChairman;
  } | null>(null);
  const [deletingChairman, setDeletingChairman] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 60,
    totalRecords: 0,
    totalPages: 0,
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: pastChairmenPageInitialValues,
    validationSchema: pastChairmenPageSchema,
    onSubmit: async function (
      formValues: PastChairmenPageValues,
      helpers: FormikHelpers<PastChairmenPageValues>,
    ) {
      setUpdating(true);
      const apiResponse = await savePage(formValues);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Past chairmen page saved successfully");
        syncSavedValues(apiResponse.body as PastChairmenPageApiBody | undefined, formValues);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save past chairmen page");
      }
      setUpdating(false);
    },
  });

  const keywordsString = useMemo(
    () => values.seo.keywords.filter((keyword) => keyword.trim()).join(", "),
    [values.seo.keywords],
  );

  const filteredChairmen = useMemo(() => {
    const query = chairmanSearch.trim().toLowerCase();
    if (!query) return values.chairmenSection.chairmen;
    return values.chairmenSection.chairmen.filter((chairman) =>
      chairman.name.toLowerCase().includes(query),
    );
  }, [chairmanSearch, values.chairmenSection.chairmen]);

  const visibleChairmen = useMemo(() => {
    const start = (chairmenPage - 1) * rowsPerPage;
    return filteredChairmen.slice(start, start + rowsPerPage);
  }, [chairmenPage, filteredChairmen, rowsPerPage]);

  const visibleChairmanOriginalIndexes = useMemo(() => {
    const query = chairmanSearch.trim().toLowerCase();
    const indexes = values.chairmenSection.chairmen
      .map((chairman, index) => ({ chairman, index }))
      .filter(({ chairman }) => !query || chairman.name.toLowerCase().includes(query))
      .map(({ index }) => index);
    const start = (chairmenPage - 1) * rowsPerPage;
    return indexes.slice(start, start + rowsPerPage);
  }, [chairmanSearch, chairmenPage, rowsPerPage, values.chairmenSection.chairmen]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredChairmen.length / rowsPerPage));
    if (chairmenPage > totalPages) setChairmenPage(totalPages);
  }, [filteredChairmen.length, chairmenPage, rowsPerPage]);

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: PastChairmenPageApiBody, fallback?: PastChairmenPageValues) {
    const nextValues = normalizePastChairmenValues(
      mergePastChairmenValues(
        pastChairmenPageInitialValues,
        body ? stripApiFields(body) : fallback,
      ),
    );
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  async function savePage(nextValues: PastChairmenPageValues) {
    const payload = normalizePastChairmenValues(nextValues);
    return hasExistingData
      ? await put("/pastChairmenPage", payload)
      : await post("/pastChairmenPage", payload, true);
  }

  useEffect(
    function () {
      async function fetchPage() {
        setLoading(true);
        const apiResponse = await get("/pastChairmenPage", true);
        if (apiResponse?.status === 200 && apiResponse.body) {
          syncSavedValues(apiResponse.body as PastChairmenPageApiBody);
          setHasExistingData(true);
        } else {
          setValues(pastChairmenPageInitialValues);
          setHasExistingData(false);
        }
        setLoading(false);
      }

      fetchPage();
    },
    [setValues],
  );

  useEffect(
    function () {
      async function fetchMedia() {
        let url = `/media?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;

        const apiResponse = await get(url, true);
        if (apiResponse?.status === 200) {
          setRecords(apiResponse.body || []);
          setPagination((oldPagination) => ({
            ...oldPagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          }));
        } else {
          setRecords([]);
        }
      }

      fetchMedia();
    },
    [pagination.page, pagination.limit, searchQuery],
  );

  function handleSelectImage(img: MediaRecord) {
    if (!selectedFileFor) return;
    if (selectedFileFor === "chairmanDraft.image") {
      setChairmanDraft((oldDraft) => ({ ...oldDraft, image: img.filename }));
      return;
    }
    void setFieldValue(selectedFileFor, img.filename);
  }

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        formData.append("files", file);
      } else {
        toast.error("Only JPG, PNG, and WEBP images are allowed.");
      }
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
        setRecords((oldRecords) => [...apiData.body, ...oldRecords]);
        toast.success(apiData.message || "Image uploaded successfully");
      } else {
        toast.error(apiData.message || "Unable to upload image");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image");
    }
    event.target.value = "";
  }

  function openAddDrawer() {
    setDrawerMode("add");
    setEditingChairmanIndex(null);
    setChairmanDraft(createEmptyPastChairman());
    setChairmanErrors({});
    setDrawerOpen(true);
  }

  function openEditDrawer(originalIndex: number) {
    setDrawerMode("edit");
    setEditingChairmanIndex(originalIndex);
    setChairmanDraft({ ...values.chairmenSection.chairmen[originalIndex] });
    setChairmanErrors({});
    setDrawerOpen(true);
  }

  function validateChairmanDraft() {
    const nextErrors: ChairmanFormErrors = {};
    if (!chairmanDraft.name.trim()) nextErrors.name = "Full name is required";
    if (!chairmanDraft.tenure.trim()) nextErrors.tenure = "Tenure is required";
    if (!chairmanDraft.company.trim()) nextErrors.company = "Company is required";
    setChairmanErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveChairman() {
    if (!validateChairmanDraft()) return;

    const cleanChairman: PastChairman = {
      name: chairmanDraft.name.trim(),
      tenure: chairmanDraft.tenure.trim(),
      company: chairmanDraft.company.trim(),
      image: chairmanDraft.image,
    };
    const nextChairmen =
      drawerMode === "edit" && editingChairmanIndex !== null
        ? values.chairmenSection.chairmen.map((chairman, index) =>
            index === editingChairmanIndex ? cleanChairman : chairman,
          )
        : [cleanChairman, ...values.chairmenSection.chairmen];
    const nextValues: PastChairmenPageValues = {
      ...values,
      chairmenSection: {
        ...values.chairmenSection,
        chairmen: nextChairmen,
      },
    };

    setSavingChairman(true);
    const apiResponse = await savePage(nextValues);

    if (apiResponse?.status === 200) {
      syncSavedValues(apiResponse.body as PastChairmenPageApiBody | undefined, nextValues);
      toast.success(drawerMode === "add" ? "Chairman added successfully" : "Chairman updated successfully");
      setDrawerOpen(false);
      setChairmanDraft(createEmptyPastChairman());
      setEditingChairmanIndex(null);
      if (drawerMode === "add") setChairmenPage(1);
    } else {
      toast.error(apiResponse?.message || "Unable to save chairman");
    }
    setSavingChairman(false);
  }

  async function confirmDeleteChairman() {
    if (!chairmanToDelete) return;

    const nextValues: PastChairmenPageValues = {
      ...values,
      chairmenSection: {
        ...values.chairmenSection,
        chairmen: values.chairmenSection.chairmen.filter(
          (_, index) => index !== chairmanToDelete.index,
        ),
      },
    };

    setDeletingChairman(true);
    const apiResponse = await savePage(nextValues);

    if (apiResponse?.status === 200) {
      syncSavedValues(apiResponse.body as PastChairmenPageApiBody | undefined, nextValues);
      toast.success("Chairman deleted successfully");
      setChairmanToDelete(null);
    } else {
      toast.error(apiResponse?.message || "Unable to delete chairman");
    }
    setDeletingChairman(false);
  }

  function originalIndexFromVisible(visibleIndex: number) {
    return visibleChairmanOriginalIndexes[visibleIndex] ?? visibleIndex;
  }

  return (
    <div className="content-wrapper about-page-admin past-chairmen-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Pages</span>
          </div>
          <h1>Past Chairmen Page</h1>
          <p>Manage banner, intro text, past chairmen records, and SEO.</p>
        </div>
      </div>

      {loading ? <OverlayLoading /> : null}

      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Past Chairmen" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input
                      className="form-control"
                      name="bannerSection.title"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Past"
                      value={values.bannerSection.title}
                    />
                    <input
                      className="form-control"
                      name="bannerSection.highlightedTitle"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Chairmen"
                      value={values.bannerSection.highlightedTitle}
                    />
                  </div>
                  <div className="about-page-image-field is-wide">
                    {values.bannerSection.image ? (
                      <button
                        aria-label="Clear banner image"
                        className="about-page-image-clear"
                        onClick={() => setFieldValue("bannerSection.image", "")}
                        type="button"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    ) : null}
                    <button
                      className="about-page-image-picker"
                      data-bs-target="#selectPastChairmenImageFileModal"
                      data-bs-toggle="modal"
                      onClick={() => setSelectedFileFor("bannerSection.image")}
                      type="button"
                    >
                      <img
                        src={
                          values.bannerSection.image
                            ? addUrlToFile(values.bannerSection.image)
                            : "/images/select-photo.png"
                        }
                        alt="Past chairmen banner"
                      />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Past Chairmen" title="Leadership Section" />
                <div className="row">
                  <div className="form-group col-md-12">
                    <label>Badge / Eyebrow Text</label>
                    <input
                      className="form-control"
                      name="introSection.eyebrow"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Leadership Through The Years"
                      value={values.introSection.eyebrow}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Title</label>
                    <input
                      className="form-control"
                      name="introSection.title"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Illustrious. Industrious."
                      value={values.introSection.title}
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Highlighted Title</label>
                    <input
                      className="form-control"
                      name="introSection.highlightedTitle"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Always Forward-Looking."
                      value={values.introSection.highlightedTitle}
                    />
                  </div>
                </div>
                <TextareaBox
                  label="White Box Paragraphs"
                  name="introSection.paragraphs"
                  handleBlur={handleBlur}
                  handleChange={(event) => {
                    const paragraphs = event.target.value
                      .split(/\n+/)
                      .map((paragraph) => paragraph.trim())
                      .filter(Boolean);
                    void setFieldValue("introSection.paragraphs", paragraphs);
                    void setFieldValue("introSection.text", event.target.value);
                  }}
                  placeholder="Add each paragraph on a new line"
                  value={
                    values.introSection.paragraphs.length > 0
                      ? values.introSection.paragraphs.join("\n\n")
                      : values.introSection.text
                  }
                  touched={getTouched("introSection.paragraphs")}
                  error={getError("introSection.paragraphs")}
                />
                <div className="mt-3">
                  <label>Quote / Highlight Line</label>
                  <input
                    className="form-control"
                    name="introSection.highlightText"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Highlighted text"
                    value={values.introSection.highlightText}
                  />
                </div>
              </div>
            </section>

            <section className="executive-members-panel">
              <div className="executive-members-header">
                <div>
                  <span>Past Chairmen Section</span>
                  <input
                    aria-label="Chairmen section heading"
                    className="executive-members-title-input"
                    name="chairmenSection.heading"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Past Chairmen"
                    value={values.chairmenSection.heading}
                  />
                </div>
                <div className="executive-members-toolbar">
                  <div className="executive-members-search">
                    <i className="fa fa-search"></i>
                    <input
                      aria-label="Search chairmen"
                      className="form-control"
                      onChange={(event) => {
                        setChairmanSearch(event.target.value);
                        setChairmenPage(1);
                      }}
                      placeholder="Search by chairman name"
                      type="search"
                      value={chairmanSearch}
                    />
                  </div>
                  <strong>{values.chairmenSection.chairmen.length} Chairmen</strong>
                  <button onClick={openAddDrawer} type="button">
                    + Add Chairman
                  </button>
                </div>
              </div>
              <PastChairmenTable
                chairmen={visibleChairmen}
                loading={loading}
                onDelete={(visibleIndex) => {
                  const originalIndex = originalIndexFromVisible(visibleIndex);
                  setChairmanToDelete({
                    index: originalIndex,
                    data: values.chairmenSection.chairmen[originalIndex],
                  });
                }}
                onEdit={(visibleIndex) => openEditDrawer(originalIndexFromVisible(visibleIndex))}
                onPageChange={setChairmenPage}
                onRowsPerPageChange={(value) => {
                  setRowsPerPage(value);
                  setChairmenPage(1);
                }}
                page={chairmenPage}
                rowsPerPage={rowsPerPage}
                totalChairmen={filteredChairmen.length}
              />
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Search" title="SEO" />
                <div className="row">
                  <div className="form-group col-md-6">
                    <label>Meta Title</label>
                    <input
                      className="form-control"
                      name="seo.metaTitle"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Meta title"
                      value={values.seo.metaTitle}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Meta Description"
                      name="seo.metaDescription"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Meta description"
                      value={values.seo.metaDescription}
                      touched={getTouched("seo.metaDescription")}
                      error={getError("seo.metaDescription")}
                    />
                  </div>
                  <div className="form-group col-md-12 mb-0">
                    <TextareaBox
                      label="SEO Keywords"
                      name="seo.keywords"
                      handleBlur={() => {}}
                      handleChange={(event) => {
                        const keywords = event.target.value
                          .split(",")
                          .map((keyword) => keyword.trim())
                          .filter(Boolean);
                        void setFieldValue("seo.keywords", keywords);
                      }}
                      placeholder="keyword one, keyword two"
                      value={keywordsString}
                      touched={getTouched("seo.keywords")}
                      error={getError("seo.keywords")}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="about-page-sticky-actions">
              <div>
                <strong>Past Chairmen Page</strong>
                <span>Save page content and chairmen records.</span>
              </div>
              <SubmitButton loading={updating} text="Update Details" />
            </div>
          </main>
        </div>
      </form>

      <PastChairmanDrawer
        draft={chairmanDraft}
        errors={chairmanErrors}
        mode={drawerMode}
        onChange={(field, value) => {
          setChairmanDraft((oldDraft) => ({ ...oldDraft, [field]: value }));
          setChairmanErrors((oldErrors) => ({ ...oldErrors, [field]: undefined }));
        }}
        onClose={() => {
          if (!savingChairman) setDrawerOpen(false);
        }}
        onPickImage={() => {
          setSelectedFileFor("chairmanDraft.image");
        }}
        onSave={saveChairman}
        open={drawerOpen}
        saving={savingChairman}
      />

      <DeleteChairmanModal
        deleting={deletingChairman}
        chairman={chairmanToDelete}
        onCancel={() => {
          if (!deletingChairman) setChairmanToDelete(null);
        }}
        onConfirm={confirmDeleteChairman}
      />

      <div
        className="modal fade"
        id="selectPastChairmenImageFileModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectPastChairmenImageFileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectPastChairmenImageFileModalLabel">
                Select Image
              </h1>
              <input type="file" onChange={handleUploadFile} />
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="about-page-media-toolbar">
                <input
                  className="form-control"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search media"
                  type="search"
                  value={searchQuery}
                />
              </div>
              <div className="row mb-2 gy-2 media-list-section">
                {records.map((item) => (
                  <div className="col-md-2 col-4" key={item._id || item.filename}>
                    <button
                      className="about-page-media-card"
                      data-bs-dismiss="modal"
                      onClick={() => handleSelectImage(item)}
                      type="button"
                    >
                      <img src={addUrlToFile(item.filename)} alt="" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-3">
              <Pagination
                pagination={pagination}
                setPagination={setPagination}
                tableName="table-to-xls"
                csvFileName="images"
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary px-3 py-2" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
