import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile } from "../../utills/addUrlToFile";
import {
  SubCommittee,
  SubCommitteesPageValues,
  createEmptySubCommittee,
  subCommitteesPageInitialValues,
  subCommitteesPageSchema,
} from "../../validationSchemas/subCommitteesPageSchema";

type ApiBody = Partial<SubCommitteesPageValues> & {
  _id?: string;
  __v?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MediaRecord = { _id?: string; filename: string };
type DrawerMode = "add" | "edit";
type FormErrors = Partial<Record<"committeeName" | "headName" | "headCompany", string>>;

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

function stripApiFields(data: ApiBody): Partial<SubCommitteesPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: SubCommitteesPageValues): SubCommitteesPageValues {
  return {
    ...values,
    committeesSection: {
      ...values.committeesSection,
      committees: values.committeesSection.committees.map((committee) => ({
        ...committee,
        teamMembers: committee.teamMembers.map((member) => member.trim()).filter(Boolean),
      })),
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

function CommitteeDrawer({
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
  draft: SubCommittee;
  errors: FormErrors;
  mode: DrawerMode;
  open: boolean;
  saving: boolean;
  onChange: (field: keyof SubCommittee, value: string | string[]) => void;
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
            <span>Sub Committees</span>
            <h2>{mode === "add" ? "Add Sub Committee" : "Edit Sub Committee"}</h2>
          </div>
          <button aria-label="Close drawer" disabled={saving} onClick={onClose} type="button">
            <i className="fa fa-times"></i>
          </button>
        </div>
        <div className="executive-member-drawer__body">
          <div className="executive-form-field">
            <label>Head Photo</label>
            <button
              className="executive-avatar-upload"
              data-bs-target="#selectSubCommitteesImageFileModal"
              data-bs-toggle="modal"
              onClick={onPickImage}
              type="button"
            >
              <span className="executive-member-avatar">
                {draft.image ? <img src={addUrlToFile(draft.image)} alt={draft.headName || "Committee head"} /> : <i className="fa fa-user"></i>}
              </span>
              <strong>{draft.image ? "Change photo" : "Select photo"}</strong>
            </button>
          </div>
          <div className="executive-form-field">
            <label>Committee Name</label>
            <input className="form-control" onChange={(event) => onChange("committeeName", event.target.value)} placeholder="Committee name" value={draft.committeeName} />
            {errors.committeeName ? <small>{errors.committeeName}</small> : null}
          </div>
          <div className="executive-form-field">
            <label>Head Name</label>
            <input className="form-control" onChange={(event) => onChange("headName", event.target.value)} placeholder="Head name" value={draft.headName} />
            {errors.headName ? <small>{errors.headName}</small> : null}
          </div>
          <div className="executive-form-field">
            <label>Company / Role</label>
            <input className="form-control" onChange={(event) => onChange("headCompany", event.target.value)} placeholder="Company or role" value={draft.headCompany} />
            {errors.headCompany ? <small>{errors.headCompany}</small> : null}
          </div>
          <div className="executive-form-field">
            <label>Team Members</label>
            <textarea
              className="form-control"
              onChange={(event) => onChange("teamMembers", event.target.value.split("\n"))}
              placeholder="One team member per line"
              value={draft.teamMembers.join("\n")}
            />
          </div>
        </div>
        <div className="executive-member-drawer__footer">
          <button disabled={saving} onClick={onClose} type="button">Cancel</button>
          <button disabled={saving} onClick={onSave} type="button">
            {saving ? "Saving..." : mode === "add" ? "Save Committee" : "Update Committee"}
          </button>
        </div>
      </aside>
    </>
  );
}

function DeleteCommitteeModal({
  deleting,
  committee,
  onCancel,
  onConfirm,
}: {
  deleting: boolean;
  committee: { index: number; data: SubCommittee } | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return committee ? (
    <div className="executive-delete-modal-shell">
      <div className="executive-delete-modal-backdrop" />
      <div className="executive-delete-modal" role="dialog" aria-modal="true">
        <div className="executive-delete-modal__icon"><i className="fa fa-trash"></i></div>
        <h2>Delete Committee</h2>
        <p>Are you sure you want to delete this committee? This action cannot be undone.</p>
        <strong>{committee.data.committeeName || "Selected committee"}</strong>
        <div>
          <button disabled={deleting} onClick={onCancel} type="button">Cancel</button>
          <button disabled={deleting} onClick={onConfirm} type="button">{deleting ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
    </div>
  ) : null;
}

function CommitteesTable({
  committees,
  loading,
  page,
  rowsPerPage,
  totalCommittees,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
}: {
  committees: SubCommittee[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalCommittees: number;
  onEdit: (visibleIndex: number) => void;
  onDelete: (visibleIndex: number) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (value: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCommittees / rowsPerPage));
  const start = totalCommittees === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalCommittees);
  const pageItems = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) => pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - page) <= 1,
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
              <th>Committee</th>
              <th>Head</th>
              <th>Company / Role</th>
              <th>Members</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className="executive-table-state">Loading committees...</div></td></tr>
            ) : committees.length === 0 ? (
              <tr><td colSpan={6}><div className="executive-table-state"><i className="fa fa-users"></i><span>No committees found</span></div></td></tr>
            ) : committees.map((committee, index) => (
              <tr key={`${committee.committeeName}-${index}`}>
                <td><div className="executive-table-avatar">{committee.image ? <img src={addUrlToFile(committee.image)} alt={committee.headName} /> : <i className="fa fa-user"></i>}</div></td>
                <td><strong>{committee.committeeName || "-"}</strong></td>
                <td>{committee.headName || "-"}</td>
                <td>{committee.headCompany || "-"}</td>
                <td>{committee.teamMembers.length}</td>
                <td>
                  <div className="executive-table-actions">
                    <button aria-label="Edit committee" title="Edit" onClick={() => onEdit(index)} type="button"><i className="fa fa-pencil"></i></button>
                    <button aria-label="Delete committee" title="Delete" onClick={() => onDelete(index)} type="button"><i className="fa fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="executive-table-footer">
        <span>Showing {start}-{end} of {totalCommittees}</span>
        <div>
          <label>Rows per page
            <select onChange={(event) => onRowsPerPageChange(Number(event.target.value))} value={rowsPerPage}>
              <option value={7}>7</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} type="button">Previous</button>
          <div className="executive-pagination-pages" aria-label="Pagination pages">
            {paginationItems.map((item, index) => item === "..." ? <span key={`dots-${index}`}>...</span> : (
              <button aria-current={item === page ? "page" : undefined} className={item === page ? "is-active" : ""} disabled={item === page} key={item} onClick={() => onPageChange(item)} type="button">{item}</button>
            ))}
          </div>
          <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} type="button">Next</button>
        </div>
      </div>
    </div>
  );
}

export function SubCommitteesPageContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<SubCommittee>(createEmptySubCommittee());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [savingCommittee, setSavingCommittee] = useState(false);
  const [committeeSearch, setCommitteeSearch] = useState("");
  const [committeesPage, setCommitteesPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [committeeToDelete, setCommitteeToDelete] = useState<{ index: number; data: SubCommittee } | null>(null);
  const [deletingCommittee, setDeletingCommittee] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: subCommitteesPageInitialValues,
    validationSchema: subCommitteesPageSchema,
    onSubmit: async (formValues: SubCommitteesPageValues, helpers: FormikHelpers<SubCommitteesPageValues>) => {
      setUpdating(true);
      const apiResponse = await savePage(formValues);
      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Sub committees page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, formValues);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save sub committees page");
      }
      setUpdating(false);
    },
  });

  const keywordsString = useMemo(() => values.seo.keywords.filter((keyword) => keyword.trim()).join(", "), [values.seo.keywords]);
  const filteredCommittees = useMemo(() => {
    const query = committeeSearch.trim().toLowerCase();
    if (!query) return values.committeesSection.committees;
    return values.committeesSection.committees.filter((committee) =>
      committee.committeeName.toLowerCase().includes(query) || committee.headName.toLowerCase().includes(query),
    );
  }, [committeeSearch, values.committeesSection.committees]);
  const visibleCommittees = useMemo(() => {
    const start = (committeesPage - 1) * rowsPerPage;
    return filteredCommittees.slice(start, start + rowsPerPage);
  }, [committeesPage, filteredCommittees, rowsPerPage]);
  const visibleOriginalIndexes = useMemo(() => {
    const query = committeeSearch.trim().toLowerCase();
    const indexes = values.committeesSection.committees
      .map((committee, index) => ({ committee, index }))
      .filter(({ committee }) => !query || committee.committeeName.toLowerCase().includes(query) || committee.headName.toLowerCase().includes(query))
      .map(({ index }) => index);
    const start = (committeesPage - 1) * rowsPerPage;
    return indexes.slice(start, start + rowsPerPage);
  }, [committeeSearch, committeesPage, rowsPerPage, values.committeesSection.committees]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCommittees.length / rowsPerPage));
    if (committeesPage > totalPages) setCommitteesPage(totalPages);
  }, [filteredCommittees.length, committeesPage, rowsPerPage]);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get("/subCommitteesPage", true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        syncSavedValues(apiResponse.body as ApiBody);
        setHasExistingData(true);
      } else {
        setValues(subCommitteesPageInitialValues);
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
        setPagination((old) => ({ ...old, page: apiResponse?.page as number, totalPages: apiResponse?.totalPages as number, totalRecords: apiResponse?.totalRecords as number }));
      } else setRecords([]);
    }
    fetchMedia();
  }, [pagination.page, pagination.limit, searchQuery]);

  function syncSavedValues(body?: ApiBody, fallback?: SubCommitteesPageValues) {
    const nextValues = normalizeValues(mergeValues(subCommitteesPageInitialValues, body ? stripApiFields(body) : fallback));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  async function savePage(nextValues: SubCommitteesPageValues) {
    const payload = normalizeValues(nextValues);
    return hasExistingData ? await put("/subCommitteesPage", payload) : await post("/subCommitteesPage", payload, true);
  }

  function getError(name: string) {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string) {
    return Boolean(getIn(touched, name));
  }

  function handleSelectImage(img: MediaRecord) {
    if (!selectedFileFor) return;
    if (selectedFileFor === "draft.image") {
      setDraft((oldDraft) => ({ ...oldDraft, image: img.filename }));
      return;
    }
    void setFieldValue(selectedFileFor, img.filename);
  }

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
      const apiResponse = await fetch(`${API_URL}/media`, { method: "POST", body: formData, headers: { Authorization: `Bearer ${token}` } });
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

  function openAddDrawer() {
    setDrawerMode("add");
    setEditingIndex(null);
    setDraft(createEmptySubCommittee());
    setFormErrors({});
    setDrawerOpen(true);
  }

  function openEditDrawer(index: number) {
    setDrawerMode("edit");
    setEditingIndex(index);
    setDraft({ ...values.committeesSection.committees[index] });
    setFormErrors({});
    setDrawerOpen(true);
  }

  function validateDraft() {
    const nextErrors: FormErrors = {};
    if (!draft.committeeName.trim()) nextErrors.committeeName = "Committee name is required";
    if (!draft.headName.trim()) nextErrors.headName = "Head name is required";
    if (!draft.headCompany.trim()) nextErrors.headCompany = "Company or role is required";
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveCommittee() {
    if (!validateDraft()) return;
    const cleanCommittee: SubCommittee = {
      committeeName: draft.committeeName.trim(),
      headName: draft.headName.trim(),
      headCompany: draft.headCompany.trim(),
      image: draft.image,
      teamMembers: draft.teamMembers.map((member) => member.trim()).filter(Boolean),
    };
    const nextCommittees = drawerMode === "edit" && editingIndex !== null
      ? values.committeesSection.committees.map((committee, index) => index === editingIndex ? cleanCommittee : committee)
      : [cleanCommittee, ...values.committeesSection.committees];
    const nextValues = { ...values, committeesSection: { ...values.committeesSection, committees: nextCommittees } };
    setSavingCommittee(true);
    const apiResponse = await savePage(nextValues);
    if (apiResponse?.status === 200) {
      syncSavedValues(apiResponse.body as ApiBody | undefined, nextValues);
      toast.success(drawerMode === "add" ? "Committee added successfully" : "Committee updated successfully");
      setDrawerOpen(false);
      setDraft(createEmptySubCommittee());
      setEditingIndex(null);
      if (drawerMode === "add") setCommitteesPage(1);
    } else toast.error(apiResponse?.message || "Unable to save committee");
    setSavingCommittee(false);
  }

  async function confirmDeleteCommittee() {
    if (!committeeToDelete) return;
    const nextValues = {
      ...values,
      committeesSection: {
        ...values.committeesSection,
        committees: values.committeesSection.committees.filter((_, index) => index !== committeeToDelete.index),
      },
    };
    setDeletingCommittee(true);
    const apiResponse = await savePage(nextValues);
    if (apiResponse?.status === 200) {
      syncSavedValues(apiResponse.body as ApiBody | undefined, nextValues);
      toast.success("Committee deleted successfully");
      setCommitteeToDelete(null);
    } else toast.error(apiResponse?.message || "Unable to delete committee");
    setDeletingCommittee(false);
  }

  function originalIndexFromVisible(index: number) {
    return visibleOriginalIndexes[index] ?? index;
  }

  return (
    <div className="content-wrapper about-page-admin past-chairmen-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions"><GoBackButton /><span className="about-page-admin__eyebrow">Pages</span></div>
          <h1>Sub Committees Page</h1>
          <p>Manage banner, intro text, sub committees, and SEO.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Sub Committees" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input className="form-control" name="bannerSection.title" onBlur={handleBlur} onChange={handleChange} placeholder="Sub" value={values.bannerSection.title} />
                    <input className="form-control" name="bannerSection.highlightedTitle" onBlur={handleBlur} onChange={handleChange} placeholder="Committees" value={values.bannerSection.highlightedTitle} />
                  </div>
                  <div className="about-page-image-field is-wide">
                    {values.bannerSection.image ? <button aria-label="Clear banner image" className="about-page-image-clear" onClick={() => setFieldValue("bannerSection.image", "")} type="button"><i className="fa fa-times"></i></button> : null}
                    <button className="about-page-image-picker" data-bs-target="#selectSubCommitteesImageFileModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor("bannerSection.image")} type="button">
                      <img src={values.bannerSection.image ? addUrlToFile(values.bannerSection.image) : "/images/select-photo.png"} alt="Sub committees banner" />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Sub Committees" title="Intro Text" />
                <TextareaBox label="Intro Text" name="introSection.text" handleBlur={handleBlur} handleChange={handleChange} placeholder="Intro paragraph" value={values.introSection.text} touched={getTouched("introSection.text")} error={getError("introSection.text")} />
                <div className="mt-3">
                  <label>Highlighted Text</label>
                  <input className="form-control" name="introSection.highlightText" onBlur={handleBlur} onChange={handleChange} placeholder="Highlighted text" value={values.introSection.highlightText} />
                </div>
              </div>
            </section>
            <section className="executive-members-panel">
              <div className="executive-members-header">
                <div>
                  <span>Sub Committees</span>
                  <input aria-label="Committees section heading" className="executive-members-title-input" name="committeesSection.heading" onBlur={handleBlur} onChange={handleChange} placeholder="Sub Committees" value={values.committeesSection.heading} />
                </div>
                <div className="executive-members-toolbar">
                  <div className="executive-members-search">
                    <i className="fa fa-search"></i>
                    <input aria-label="Search committees" className="form-control" onChange={(event) => { setCommitteeSearch(event.target.value); setCommitteesPage(1); }} placeholder="Search by committee or head" type="search" value={committeeSearch} />
                  </div>
                  <strong>{values.committeesSection.committees.length} Committees</strong>
                  <button onClick={openAddDrawer} type="button">+ Add Committee</button>
                </div>
              </div>
              <CommitteesTable
                committees={visibleCommittees}
                loading={loading}
                onDelete={(visibleIndex) => {
                  const originalIndex = originalIndexFromVisible(visibleIndex);
                  setCommitteeToDelete({ index: originalIndex, data: values.committeesSection.committees[originalIndex] });
                }}
                onEdit={(visibleIndex) => openEditDrawer(originalIndexFromVisible(visibleIndex))}
                onPageChange={setCommitteesPage}
                onRowsPerPageChange={(value) => { setRowsPerPage(value); setCommitteesPage(1); }}
                page={committeesPage}
                rowsPerPage={rowsPerPage}
                totalCommittees={filteredCommittees.length}
              />
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
                    <TextareaBox label="SEO Keywords" name="seo.keywords" handleBlur={() => {}} handleChange={(event) => { const keywords = event.target.value.split(",").map((keyword) => keyword.trim()).filter(Boolean); void setFieldValue("seo.keywords", keywords); }} placeholder="keyword one, keyword two" value={keywordsString} touched={getTouched("seo.keywords")} error={getError("seo.keywords")} />
                  </div>
                </div>
              </div>
            </section>
            <div className="about-page-sticky-actions">
              <div><strong>Sub Committees Page</strong><span>Save page content and committee records.</span></div>
              <SubmitButton loading={updating} text="Update Details" />
            </div>
          </main>
        </div>
      </form>
      <CommitteeDrawer
        draft={draft}
        errors={formErrors}
        mode={drawerMode}
        onChange={(field, value) => { setDraft((old) => ({ ...old, [field]: value })); setFormErrors((old) => ({ ...old, [field]: undefined })); }}
        onClose={() => { if (!savingCommittee) setDrawerOpen(false); }}
        onPickImage={() => setSelectedFileFor("draft.image")}
        onSave={saveCommittee}
        open={drawerOpen}
        saving={savingCommittee}
      />
      <DeleteCommitteeModal deleting={deletingCommittee} committee={committeeToDelete} onCancel={() => { if (!deletingCommittee) setCommitteeToDelete(null); }} onConfirm={confirmDeleteCommittee} />
      <div className="modal fade" id="selectSubCommitteesImageFileModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectSubCommitteesImageFileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectSubCommitteesImageFileModalLabel">Select Image</h1>
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
                    <button className="about-page-media-card" data-bs-dismiss="modal" onClick={() => handleSelectImage(item)} type="button">
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
