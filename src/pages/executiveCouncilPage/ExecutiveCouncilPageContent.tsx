import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  ExecutiveCouncilMember,
  ExecutiveCouncilPageValues,
  executiveCouncilPageInitialValues,
  executiveCouncilPageSchema,
  createEmptyExecutiveCouncilMember,
} from "../../validationSchemas/executiveCouncilPageSchema";

type ExecutiveCouncilPageApiBody = Partial<ExecutiveCouncilPageValues> & {
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

type MemberDraft = ExecutiveCouncilMember;

type DrawerMode = "add" | "edit";

type MemberFormErrors = Partial<Record<"name" | "designation" | "company", string>>;

type ExecutiveCouncilAdminView = "page" | "members";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeExecutiveCouncilValues<T>(initial: T, incoming: unknown): T {
  if (Array.isArray(initial)) {
    return (Array.isArray(incoming) ? incoming : initial) as T;
  }

  if (isPlainObject(initial)) {
    const source = isPlainObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};

    Object.keys(initial).forEach((key) => {
      result[key] = mergeExecutiveCouncilValues(initial[key], source[key]);
    });

    return result as T;
  }

  return (incoming === undefined || incoming === null ? initial : incoming) as T;
}

function stripApiFields(
  data: ExecutiveCouncilPageApiBody,
): Partial<ExecutiveCouncilPageValues> {
  const payload = { ...data };

  delete payload._id;
  delete payload.__v;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;

  return payload;
}

function normalizeExecutiveCouncilValues(
  values: ExecutiveCouncilPageValues,
): ExecutiveCouncilPageValues {
  return {
    ...values,
    councilSection: {
      ...values.councilSection,
      members: values.councilSection.members.map((member) => ({
        name: member.name.trim(),
        designation: member.designation.trim(),
        company: member.company.trim(),
        image: member.image,
      })),
    },
    seo: {
      ...values.seo,
      keywords: values.seo.keywords
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    },
  };
}

function formatCreatedDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="about-page-card__heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

export function ExecutiveCouncilPageContent() {
  return <ExecutiveCouncilAdminContent view="page" />;
}

export function ExecutiveCouncilMembersContent() {
  return <ExecutiveCouncilAdminContent view="members" />;
}

function AvatarUpload({
  member,
  onChange,
  onPickFromLibrary,
  onUpload,
  uploading,
}: {
  member: MemberDraft;
  onChange: (image: string) => void;
  onPickFromLibrary: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  return (
    <div className="executive-member-avatar-upload">
      <button
        className="executive-member-avatar"
        data-bs-target="#selectExecutiveCouncilImageFileModal"
        data-bs-toggle="modal"
        onClick={onPickFromLibrary}
        type="button"
      >
        {member.image ? (
          <img src={addUrlToFile(member.image)} alt={member.name || "Member"} />
        ) : (
          <i className="fa fa-user"></i>
        )}
      </button>
      <div>
        <strong>Profile Photo</strong>
        <span>Upload or select from media library</span>
        <div className="executive-member-avatar-actions">
          <label>
            Upload
            <input
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file);
                event.target.value = "";
              }}
              type="file"
            />
          </label>
          <button
            data-bs-target="#selectExecutiveCouncilImageFileModal"
            data-bs-toggle="modal"
            onClick={onPickFromLibrary}
            type="button"
          >
            Library
          </button>
          {member.image ? (
            <button onClick={() => onChange("")} type="button">
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ExecutiveCouncilForm({
  draft,
  errors,
  onChange,
  onPickImage,
  onUploadImage,
  uploadingImage,
}: {
  draft: MemberDraft;
  errors: MemberFormErrors;
  onChange: (field: keyof MemberDraft, value: string) => void;
  onPickImage: () => void;
  onUploadImage: (file: File) => void;
  uploadingImage: boolean;
}) {
  return (
    <div className="executive-member-form">
      <AvatarUpload
        member={draft}
        onChange={(image) => onChange("image", image)}
        onPickFromLibrary={onPickImage}
        onUpload={onUploadImage}
        uploading={uploadingImage}
      />
      <label>
        <span>Full Name</span>
        <input
          autoFocus
          className={errors.name ? "form-control is-invalid" : "form-control"}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="Full name"
          value={draft.name}
        />
        {errors.name ? <small>{errors.name}</small> : null}
      </label>
      <label>
        <span>Designation</span>
        <input
          className={errors.designation ? "form-control is-invalid" : "form-control"}
          onChange={(event) => onChange("designation", event.target.value)}
          placeholder="Designation"
          value={draft.designation}
        />
        {errors.designation ? <small>{errors.designation}</small> : null}
      </label>
      <label>
        <span>Company</span>
        <textarea
          className={errors.company ? "form-control is-invalid" : "form-control"}
          onChange={(event) => onChange("company", event.target.value)}
          placeholder="Company"
          rows={3}
          value={draft.company}
        />
        {errors.company ? <small>{errors.company}</small> : null}
      </label>
      <div className="executive-member-disabled-fields">
        <input className="form-control" disabled placeholder="Email (requires API field)" />
        <input className="form-control" disabled placeholder="Phone (requires API field)" />
        <input className="form-control" disabled placeholder="LinkedIn URL (requires API field)" />
      </div>
    </div>
  );
}

function ExecutiveCouncilDrawer({
  open,
  mode,
  draft,
  errors,
  saving,
  uploadingImage,
  onClose,
  onChange,
  onSave,
  onPickImage,
  onUploadImage,
}: {
  open: boolean;
  mode: DrawerMode;
  draft: MemberDraft;
  errors: MemberFormErrors;
  saving: boolean;
  uploadingImage: boolean;
  onClose: () => void;
  onChange: (field: keyof MemberDraft, value: string) => void;
  onSave: () => void;
  onPickImage: () => void;
  onUploadImage: (file: File) => void;
}) {
  return (
    <>
      <div className={open ? "executive-drawer-backdrop is-open" : "executive-drawer-backdrop"} />
      <aside
        aria-hidden={!open}
        className={open ? "executive-member-drawer is-open" : "executive-member-drawer"}
      >
        <div className="executive-member-drawer__header">
          <div>
            <span>Executive Council</span>
            <h2>{mode === "add" ? "Add Executive Council Member" : "Edit Executive Council Member"}</h2>
          </div>
          <button aria-label="Close drawer" onClick={onClose} type="button">
            <i className="fa fa-times"></i>
          </button>
        </div>
        <div className="executive-member-drawer__body">
          <ExecutiveCouncilForm
            draft={draft}
            errors={errors}
            onChange={onChange}
            onPickImage={onPickImage}
            onUploadImage={onUploadImage}
            uploadingImage={uploadingImage}
          />
        </div>
        <div className="executive-member-drawer__footer">
          <button disabled={saving} onClick={onClose} type="button">
            Cancel
          </button>
          <button disabled={saving} onClick={onSave} type="button">
            {saving ? "Saving..." : "Save Member"}
          </button>
        </div>
      </aside>
    </>
  );
}

function DeleteMemberModal({
  member,
  deleting,
  onCancel,
  onConfirm,
}: {
  member: { index: number; data: ExecutiveCouncilMember } | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return member ? (
    <div className="executive-delete-modal-shell">
      <div className="executive-delete-modal-backdrop" />
      <div className="executive-delete-modal" role="dialog" aria-modal="true">
        <div className="executive-delete-modal__icon">
          <i className="fa fa-trash"></i>
        </div>
        <h2>Delete Member</h2>
        <p>Are you sure you want to delete this member? This action cannot be undone.</p>
        <strong>{member.data.name || "Selected member"}</strong>
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

function ExecutiveCouncilTable({
  members,
  loading,
  page,
  rowsPerPage,
  totalMembers,
  createdDate,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
}: {
  members: ExecutiveCouncilMember[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalMembers: number;
  createdDate?: string;
  onEdit: (visibleIndex: number) => void;
  onDelete: (visibleIndex: number) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (value: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalMembers / rowsPerPage));
  const start = totalMembers === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalMembers);
  const pageItems = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - page) <= 1,
  );
  const paginationItems = pageItems.reduce<(number | "...")[]>((items, pageNumber) => {
    const previous = items[items.length - 1];
    if (typeof previous === "number" && pageNumber - previous > 1) {
      items.push("...");
    }
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
              <th>Designation</th>
              <th>Company</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <div className="executive-table-state">Loading members...</div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="executive-table-state">
                    <i className="fa fa-users"></i>
                    <span>No members found</span>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {members.map((member, index) => (
                  <tr key={`${member.name}-${index}`}>
                    <td>
                      <div className="executive-table-avatar">
                        {member.image ? (
                          <img src={addUrlToFile(member.image)} alt={member.name} />
                        ) : (
                          <i className="fa fa-user"></i>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{member.name || "-"}</strong>
                    </td>
                    <td>{member.designation || "-"}</td>
                    <td>{member.company || "-"}</td>
                    <td>{formatCreatedDate(createdDate)}</td>
                    <td>
                      <div className="executive-table-actions">
                        <button
                          aria-label={`Edit ${member.name || "member"}`}
                          title="Edit"
                          onClick={() => onEdit(index)}
                          type="button"
                        >
                          <i className="fa fa-pencil"></i>
                        </button>
                        <button
                          aria-label={`Delete ${member.name || "member"}`}
                          title="Delete"
                          onClick={() => onDelete(index)}
                          type="button"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
      <div className="executive-table-footer">
        <span>
          Showing {start}-{end} of {totalMembers}
        </span>
        <div>
          <label>
            Rows per page
            <select
              onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
              value={rowsPerPage}
            >
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
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ExecutiveCouncilAdminContent({ view }: { view: ExecutiveCouncilAdminView }) {
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add");
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [memberDraft, setMemberDraft] = useState<MemberDraft>(createEmptyExecutiveCouncilMember());
  const [memberErrors, setMemberErrors] = useState<MemberFormErrors>({});
  const [savingMember, setSavingMember] = useState(false);
  const [uploadingMemberImage, setUploadingMemberImage] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    index: number;
    data: ExecutiveCouncilMember;
  } | null>(null);
  const [deletingMember, setDeletingMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [membersPage, setMembersPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [pageCreatedAt, setPageCreatedAt] = useState<string | undefined>();
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
    initialValues: executiveCouncilPageInitialValues,
    validationSchema: executiveCouncilPageSchema,
    onSubmit: async function (
      formValues: ExecutiveCouncilPageValues,
      helpers: FormikHelpers<ExecutiveCouncilPageValues>,
    ) {
      setUpdating(true);
      const apiResponse = await savePage(formValues);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Executive council page saved successfully");
        syncSavedValues(apiResponse.body as ExecutiveCouncilPageApiBody | undefined, formValues);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save executive council page");
      }
      setUpdating(false);
    },
  });

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) return values.councilSection.members;
    return values.councilSection.members.filter((member) =>
      member.name.toLowerCase().includes(query),
    );
  }, [memberSearch, values.councilSection.members]);

  const visibleMembers = useMemo(() => {
    const start = (membersPage - 1) * rowsPerPage;
    return filteredMembers.slice(start, start + rowsPerPage);
  }, [filteredMembers, membersPage, rowsPerPage]);

  const visibleMemberOriginalIndexes = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    const indexes = values.councilSection.members
      .map((member, index) => ({ member, index }))
      .filter(({ member }) => !query || member.name.toLowerCase().includes(query))
      .map(({ index }) => index);
    const start = (membersPage - 1) * rowsPerPage;
    return indexes.slice(start, start + rowsPerPage);
  }, [memberSearch, membersPage, rowsPerPage, values.councilSection.members]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / rowsPerPage));
    if (membersPage > totalPages) setMembersPage(totalPages);
  }, [filteredMembers.length, membersPage, rowsPerPage]);

  useEffect(
    function () {
      async function fetchPage() {
        setLoading(true);
        const apiResponse = await get("/executiveCouncilPage", true);

        if (apiResponse?.status === 200 && apiResponse.body) {
          syncSavedValues(apiResponse.body as ExecutiveCouncilPageApiBody);
          setHasExistingData(true);
        } else {
          setValues(executiveCouncilPageInitialValues);
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

  function syncSavedValues(
    body?: ExecutiveCouncilPageApiBody,
    fallback?: ExecutiveCouncilPageValues,
  ) {
    const nextValues = normalizeExecutiveCouncilValues(
      mergeExecutiveCouncilValues(
        executiveCouncilPageInitialValues,
        body ? stripApiFields(body) : fallback,
      ),
    );
    setValues(nextValues);
    setPageCreatedAt(body?.createdAt);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  async function savePage(nextValues: ExecutiveCouncilPageValues) {
    const payload = normalizeExecutiveCouncilValues(nextValues);
    return hasExistingData
      ? await put("/executiveCouncilPage", payload)
      : await post("/executiveCouncilPage", payload, true);
  }

  function handleSelectImage(img: MediaRecord) {
    if (!selectedFileFor) return;

    if (selectedFileFor === "memberDraft.image") {
      setMemberDraft((oldDraft) => ({ ...oldDraft, image: img.filename }));
      return;
    }

    void setFieldValue(selectedFileFor, img.filename);
  }

  function openAddDrawer() {
    setDrawerMode("add");
    setEditingMemberIndex(null);
    setMemberDraft(createEmptyExecutiveCouncilMember());
    setMemberErrors({});
    setDrawerOpen(true);
  }

  function openEditDrawer(originalIndex: number) {
    setDrawerMode("edit");
    setEditingMemberIndex(originalIndex);
    setMemberDraft({ ...values.councilSection.members[originalIndex] });
    setMemberErrors({});
    setDrawerOpen(true);
  }

  function validateMemberDraft() {
    const nextErrors: MemberFormErrors = {};
    if (!memberDraft.name.trim()) nextErrors.name = "Full name is required";
    if (!memberDraft.designation.trim()) nextErrors.designation = "Designation is required";
    if (!memberDraft.company.trim()) nextErrors.company = "Company is required";
    setMemberErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveMember() {
    if (!validateMemberDraft()) return;

    const cleanMember: ExecutiveCouncilMember = {
      name: memberDraft.name.trim(),
      designation: memberDraft.designation.trim(),
      company: memberDraft.company.trim(),
      image: memberDraft.image,
    };
    const nextMembers =
      drawerMode === "edit" && editingMemberIndex !== null
        ? values.councilSection.members.map((member, index) =>
            index === editingMemberIndex ? cleanMember : member,
          )
        : [cleanMember, ...values.councilSection.members];
    const nextValues: ExecutiveCouncilPageValues = {
      ...values,
      councilSection: {
        ...values.councilSection,
        members: nextMembers,
      },
    };

    setSavingMember(true);
    const apiResponse = await savePage(nextValues);

    if (apiResponse?.status === 200) {
      syncSavedValues(apiResponse.body as ExecutiveCouncilPageApiBody | undefined, nextValues);
      toast.success(drawerMode === "add" ? "Member added successfully" : "Member updated successfully");
      setDrawerOpen(false);
      setMemberDraft(createEmptyExecutiveCouncilMember());
      setEditingMemberIndex(null);
      if (drawerMode === "add") setMembersPage(1);
    } else {
      toast.error(apiResponse?.message || "Unable to save member");
    }
    setSavingMember(false);
  }

  async function confirmDeleteMember() {
    if (!memberToDelete) return;

    const nextValues: ExecutiveCouncilPageValues = {
      ...values,
      councilSection: {
        ...values.councilSection,
        members: values.councilSection.members.filter(
          (_, index) => index !== memberToDelete.index,
        ),
      },
    };

    setDeletingMember(true);
    const apiResponse = await savePage(nextValues);

    if (apiResponse?.status === 200) {
      syncSavedValues(apiResponse.body as ExecutiveCouncilPageApiBody | undefined, nextValues);
      toast.success("Member deleted successfully");
      setMemberToDelete(null);
    } else {
      toast.error(apiResponse?.message || "Unable to delete member");
    }
    setDeletingMember(false);
  }

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    await uploadFiles(Array.from(files));
    event.target.value = "";
  }

  async function uploadFiles(files: File[]) {
    const mimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const formData = new FormData();

    files.forEach((file) => {
      if (!mimeTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WEBP images are allowed.");
        return;
      }
      formData.append("files", file);
    });

    if (!formData.has("files")) return [];

    try {
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(`${API_URL}/media`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const apiData = await apiResponse.json();

      if (apiData.status === 200) {
        setRecords((oldRecords) => [...apiData.body, ...oldRecords]);
        toast.success(apiData.message || "Image uploaded successfully");
        return apiData.body as MediaRecord[];
      }

      toast.error(apiData.message || "Unable to upload image");
      return [];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to upload image";
      toast.error(message);
      return [];
    }
  }

  async function uploadMemberImage(file: File) {
    setUploadingMemberImage(true);
    const uploaded = await uploadFiles([file]);
    if (uploaded[0]?.filename) {
      setMemberDraft((oldDraft) => ({ ...oldDraft, image: uploaded[0].filename }));
    }
    setUploadingMemberImage(false);
  }

  function originalIndexFromVisible(visibleIndex: number) {
    return visibleMemberOriginalIndexes[visibleIndex] ?? visibleIndex;
  }

  const isMembersView = view === "members";

  return (
    <div className="content-wrapper about-page-admin executive-council-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Pages</span>
          </div>
          <h1>{isMembersView ? "Executive Council Members" : "Executive Council Page"}</h1>
          <p>
            {isMembersView
              ? "Manage executive council member records in a compact table view."
              : "Manage the public page banner, intro copy, and SEO."}
          </p>
        </div>
      </div>

      {loading ? <OverlayLoading /> : null}

      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            {!isMembersView ? (
            <>
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Executive Council" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input
                      className="form-control"
                      name="bannerSection.title"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Executive"
                      value={values.bannerSection.title}
                    />
                    <input
                      className="form-control"
                      name="bannerSection.highlightedTitle"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Council"
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
                      data-bs-target="#selectExecutiveCouncilImageFileModal"
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
                        alt="Executive council banner"
                      />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Executive Council" title="Intro Text" />
                <TextareaBox
                  label="Intro Text"
                  name="introSection.text"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  placeholder="Intro paragraph"
                  value={values.introSection.text}
                  touched={getTouched("introSection.text")}
                  error={getError("introSection.text")}
                />
                <div className="mt-3">
                  <label>Highlighted Text</label>
                  <input
                    className="form-control"
                    name="introSection.highlightText"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="We are indeed proud of the EC team."
                    value={values.introSection.highlightText}
                  />
                </div>
              </div>
            </section>
            </>
            ) : null}

            {isMembersView ? (
            <section className="executive-members-panel">
              <div className="executive-members-header">
                <div>
                  <span>Executive Council</span>
                  <input
                    aria-label="Council section heading"
                    className="executive-members-title-input"
                    name="councilSection.heading"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Executive Council"
                    value={values.councilSection.heading}
                  />
                </div>
                <div className="executive-members-toolbar">
                  <div className="executive-members-search">
                    <i className="fa fa-search"></i>
                    <input
                      aria-label="Search members"
                      className="form-control"
                      onChange={(event) => {
                        setMemberSearch(event.target.value);
                        setMembersPage(1);
                      }}
                      placeholder="Search by member name"
                      type="search"
                      value={memberSearch}
                    />
                  </div>
                  <strong>{values.councilSection.members.length} Members</strong>
                  <button onClick={openAddDrawer} type="button">
                    + Add Member
                  </button>
                </div>
              </div>
              <ExecutiveCouncilTable
                createdDate={pageCreatedAt}
                loading={loading}
                members={visibleMembers}
                onDelete={(visibleIndex) => {
                  const originalIndex = originalIndexFromVisible(visibleIndex);
                  setMemberToDelete({
                    index: originalIndex,
                    data: values.councilSection.members[originalIndex],
                  });
                }}
                onEdit={(visibleIndex) => openEditDrawer(originalIndexFromVisible(visibleIndex))}
                onPageChange={setMembersPage}
                onRowsPerPageChange={(value) => {
                  setRowsPerPage(value);
                  setMembersPage(1);
                }}
                page={membersPage}
                rowsPerPage={rowsPerPage}
                totalMembers={filteredMembers.length}
              />
            </section>
            ) : (
              <section className="executive-members-link-card">
                <div>
                  <span className="about-page-admin__eyebrow">Members</span>
                  <h2>Executive Council Members</h2>
                  <p>Members are managed separately so this page stays clean and easy to edit.</p>
                </div>
                <div className="executive-members-link-card__actions">
                  <strong>{values.councilSection.members.length} Members</strong>
                  <Link to="/executive-council-members">Manage Members</Link>
                </div>
              </section>
            )}

            {!isMembersView ? (
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
            ) : null}

            {!isMembersView ? (
            <div className="about-page-sticky-actions">
              <div>
                <strong>Executive Council Page</strong>
                <span>Save page content and SEO metadata.</span>
              </div>
              <SubmitButton loading={updating} text="Update Details" />
            </div>
            ) : null}
          </main>

          {!isMembersView ? (
          <aside className="about-page-admin__side">
            <div className="card about-page-card">
              <div className="card-body">
                <span className="about-page-admin__eyebrow">Publishing</span>
                <h2>Content checklist</h2>
                <ul className="about-page-check-list">
                  <li><i className="fa fa-check"></i>Banner image and text</li>
                  <li><i className="fa fa-check"></i>Intro content</li>
                  <li><i className="fa fa-check"></i>Members table</li>
                  <li><i className="fa fa-check"></i>SEO metadata</li>
                </ul>
              </div>
            </div>
          </aside>
          ) : null}
        </div>
      </form>

      {isMembersView ? (
      <ExecutiveCouncilDrawer
        draft={memberDraft}
        errors={memberErrors}
        mode={drawerMode}
        onChange={(field, value) => {
          setMemberDraft((oldDraft) => ({ ...oldDraft, [field]: value }));
          setMemberErrors((oldErrors) => ({ ...oldErrors, [field]: undefined }));
        }}
        onClose={() => {
          if (!savingMember) setDrawerOpen(false);
        }}
        onPickImage={() => setSelectedFileFor("memberDraft.image")}
        onSave={saveMember}
        onUploadImage={uploadMemberImage}
        open={drawerOpen}
        saving={savingMember}
        uploadingImage={uploadingMemberImage}
      />
      ) : null}

      {isMembersView ? (
      <DeleteMemberModal
        deleting={deletingMember}
        member={memberToDelete}
        onCancel={() => {
          if (!deletingMember) setMemberToDelete(null);
        }}
        onConfirm={confirmDeleteMember}
      />
      ) : null}

      <div
        className="modal fade"
        id="selectExecutiveCouncilImageFileModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectExecutiveCouncilImageFileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5 me-2"
                id="selectExecutiveCouncilImageFileModalLabel"
              >
                Select Image
              </h1>
              <input type="file" onChange={handleUploadFile} />
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
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
              <button
                type="button"
                className="btn btn-secondary px-3 py-2"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
