import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton, TextareaBox } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile } from "../../utills/addUrlToFile";
import {
  AssociateMemberCategory,
  MemberItem,
  MemberListKind,
  MemberListPageValues,
  createEmptyMember,
  memberListPageInitialValues,
  memberListPageSchema,
} from "../../validationSchemas/memberListPageSchema";

type ApiBody = Partial<MemberListPageValues> & {
  _id?: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
};

type MediaRecord = { _id?: string; filename: string };
type AssociateFilter = "All" | AssociateMemberCategory;

const associateCategories: AssociateFilter[] = [
  "All",
  "Finished Goods",
  "Component Manufacturer",
  "Non Manufacturing Brand Owners",
];

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

function stripApiFields(data: ApiBody): Partial<MemberListPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeMember(member: MemberItem, index: number): MemberItem {
  return {
    logo: (member.logo || "").trim(),
    name: (member.name || "").trim(),
    category: member.category || "Finished Goods",
    contactPerson: (member.contactPerson || "").trim(),
    designation: (member.designation || "").trim(),
    addressLines: (member.addressLines || []).map((line) => line.trim()).filter(Boolean),
    phones: (member.phones || []).map((phone) => phone.trim()).filter(Boolean),
    email: (member.email || "").trim(),
    website: (member.website || "").trim(),
    sortOrder: Number.isFinite(Number(member.sortOrder)) ? Number(member.sortOrder) : index,
    status: Boolean(member.status),
  };
}

function normalizeValues(values: MemberListPageValues): MemberListPageValues {
  return {
    ...values,
    primaryMembersSection: {
      ...values.primaryMembersSection,
      members: values.primaryMembersSection.members
        .map(normalizeMember)
        .filter((member) => member.name || member.logo || member.website || member.email)
        .sort((first, second) => first.sortOrder - second.sortOrder),
    },
    associateMembersSection: {
      ...values.associateMembersSection,
      members: values.associateMembersSection.members
        .map(normalizeMember)
        .filter((member) => member.name || member.logo || member.website || member.email)
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

export function MemberListPageContent() {
  const params = useParams();
  const kind: MemberListKind = params.kind === "associate" ? "associate" : "primary";
  const bannerKey = kind === "primary" ? "primaryBannerSection" : "associateBannerSection";
  const sectionKey = kind === "primary" ? "primaryMembersSection" : "associateMembersSection";
  const pageTitle = kind === "primary" ? "Primary Member List" : "Associate Member List";

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeMemberIndex, setActiveMemberIndex] = useState<number | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const [associateFilter, setAssociateFilter] = useState<AssociateFilter>("All");
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: memberListPageInitialValues,
    validationSchema: memberListPageSchema,
    onSubmit: async (formValues: MemberListPageValues, helpers: FormikHelpers<MemberListPageValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/memberListPage", payload)
        : await post("/memberListPage", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Member list page saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save member list page");
      }
      setUpdating(false);
    },
  });

  const members = values[sectionKey].members;
  const membersPerPage = 7;
  const activeMember = activeMemberIndex === null ? null : members[activeMemberIndex];
  const isAssociatePage = kind === "associate";
  const memberRows = useMemo(
    () =>
      members
        .map((member, index) => ({ member, index }))
        .filter(({ member }) => {
          const query = memberSearchQuery.trim().toLowerCase();
          if (isAssociatePage && associateFilter !== "All" && member.category !== associateFilter) return false;
          if (!query) return true;
          return [
            member.name,
            member.category,
            member.contactPerson,
            member.designation,
            member.email,
            member.website,
            ...member.addressLines,
            ...member.phones,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        }),
    [associateFilter, isAssociatePage, memberSearchQuery, members],
  );
  const memberTotalPages = Math.max(1, Math.ceil(memberRows.length / membersPerPage));
  const memberPageStart = (memberPage - 1) * membersPerPage;
  const paginatedMemberRows = memberRows.slice(memberPageStart, memberPageStart + membersPerPage);
  const visibleMemberStart = memberRows.length ? memberPageStart + 1 : 0;
  const visibleMemberEnd = Math.min(memberPageStart + membersPerPage, memberRows.length);
  const keywordsString = useMemo(() => values.seo.keywords.join(", "), [values.seo.keywords]);

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: ApiBody, fallback?: MemberListPageValues) {
    const nextValues = normalizeValues(mergeValues(memberListPageInitialValues, body ? stripApiFields(body) : fallback));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const apiResponse = await get("/memberListPage", true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        syncSavedValues(apiResponse.body as ApiBody);
        setHasExistingData(true);
      } else {
        setValues(memberListPageInitialValues);
        setHasExistingData(false);
      }
      setLoading(false);
    }
    fetchPage();
  }, [setValues]);

  useEffect(() => {
    setMemberPage(1);
  }, [associateFilter, kind, memberSearchQuery]);

  useEffect(() => {
    if (memberPage > memberTotalPages) setMemberPage(memberTotalPages);
  }, [memberPage, memberTotalPages]);

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

  function handleAddMember() {
    const nextIndex = members.length;
    const nextMember = createEmptyMember(nextIndex + 1);
    if (isAssociatePage && associateFilter !== "All") nextMember.category = associateFilter;
    void setFieldValue(`${sectionKey}.members`, [...members, nextMember]);
    setActiveMemberIndex(nextIndex);
  }

  function handleRemoveMember(index: number) {
    void setFieldValue(`${sectionKey}.members`, members.filter((_, itemIndex) => itemIndex !== index));
    if (activeMemberIndex === index) setActiveMemberIndex(null);
  }

  return (
    <div className="content-wrapper about-page-admin member-list-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Members</span>
          </div>
          <h1>{pageTitle}</h1>
          <p>Manage banner, member cards, contact details, logos, and SEO.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Members" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input className="form-control" name={`${bannerKey}.title`} onBlur={handleBlur} onChange={handleChange} placeholder="Primary" value={values[bannerKey].title} />
                    <input className="form-control" name={`${bannerKey}.highlightedTitle`} onBlur={handleBlur} onChange={handleChange} placeholder="Members List" value={values[bannerKey].highlightedTitle} />
                  </div>
                  <div className="about-page-image-field is-wide">
                    <button className="about-page-image-picker" data-bs-target="#selectMemberListMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor(`${bannerKey}.image`)} type="button">
                      <img src={values[bannerKey].image ? addUrlToFile(values[bannerKey].image) : "/images/select-photo.png"} alt="Member list banner" />
                      <span>Select banner image</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="member-table-header">
                  <SectionHeading eyebrow="Members" title={values[sectionKey].heading || "Members"} />
                  <div className="member-table-toolbar">
                    <div className="member-table-search">
                      <i className="fa fa-search"></i>
                      <input
                        className="form-control"
                        onChange={(event) => setMemberSearchQuery(event.target.value)}
                        placeholder="Search member"
                        type="search"
                        value={memberSearchQuery}
                      />
                    </div>
                    <strong>{members.length} Members</strong>
                    <button className="report-add-button" onClick={handleAddMember} type="button">
                      <i className="fa fa-plus"></i>
                      <span>Add Member</span>
                    </button>
                  </div>
                </div>
                <input className="form-control mb-3" name={`${sectionKey}.heading`} onBlur={handleBlur} onChange={handleChange} placeholder="List of Primary Members" value={values[sectionKey].heading} />
                {isAssociatePage ? (
                  <div className="member-category-tabs">
                    {associateCategories.map((category) => (
                      <button
                        className={associateFilter === category ? "is-active" : ""}
                        key={category}
                        onClick={() => setAssociateFilter(category)}
                        type="button"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="member-table-wrap">
                  <table className="member-admin-table">
                    <thead>
                      {isAssociatePage ? (
                        <tr>
                          <th>Category</th>
                          <th>Company</th>
                          <th>Contact Person</th>
                          <th>Contact</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      ) : (
                        <tr>
                          <th>Logo</th>
                          <th>Company</th>
                          <th>Address</th>
                          <th>Contact</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {paginatedMemberRows.map(({ member, index }) => (
                        <tr key={index}>
                          {isAssociatePage ? (
                            <>
                              <td><span className="member-category-pill">{member.category || "Finished Goods"}</span></td>
                              <td><strong>{member.name || "Untitled member"}</strong></td>
                              <td>
                                <strong>{member.contactPerson || "-"}</strong>
                                {member.designation ? <span>{member.designation}</span> : null}
                              </td>
                              <td>
                                {member.phones.length ? <strong>{member.phones.join(", ")}</strong> : null}
                                {member.email ? <span>{member.email}</span> : null}
                                {!member.phones.length && !member.email ? <span>-</span> : null}
                              </td>
                            </>
                          ) : (
                            <>
                              <td>
                                <button className="member-table-logo" onClick={() => setActiveMemberIndex(index)} type="button">
                                  {member.logo ? <img src={addUrlToFile(member.logo)} alt={member.name} /> : <i className="fa fa-building"></i>}
                                </button>
                              </td>
                              <td>
                                <strong>{member.name || "Untitled member"}</strong>
                                {member.website ? <span>{member.website}</span> : null}
                              </td>
                              <td>
                                <span>{member.addressLines.filter(Boolean).join(", ") || "-"}</span>
                              </td>
                              <td>
                                {member.phones.length ? <strong>{member.phones.join(", ")}</strong> : null}
                                {member.email ? <span>{member.email}</span> : null}
                                {!member.phones.length && !member.email ? <span>-</span> : null}
                              </td>
                            </>
                          )}
                          <td>
                            <span className={`marketplace-status-pill ${member.status ? "is-active" : "is-disabled"}`}>
                              {member.status ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td>
                            <div className="member-table-actions">
                              <button aria-label="Edit member" onClick={() => setActiveMemberIndex(index)} type="button"><i className="fa fa-pencil"></i></button>
                              <button aria-label="Remove member" onClick={() => handleRemoveMember(index)} type="button"><i className="fa fa-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!memberRows.length ? <div className="member-table-empty">No members found.</div> : null}
                </div>
                {memberRows.length ? (
                  <div className="member-table-pagination">
                    <span>
                      Showing {visibleMemberStart}-{visibleMemberEnd} of {memberRows.length} members
                    </span>
                    <div>
                      <button disabled={memberPage === 1} onClick={() => setMemberPage((page) => Math.max(1, page - 1))} type="button">
                        Previous
                      </button>
                      <strong>
                        {memberPage} / {memberTotalPages}
                      </strong>
                      <button disabled={memberPage === memberTotalPages} onClick={() => setMemberPage((page) => Math.min(memberTotalPages, page + 1))} type="button">
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
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
              <div><strong>{pageTitle}</strong><span>Save member list content.</span></div>
              <SubmitButton loading={updating} text="Update Members" />
            </div>
          </main>
        </div>
      </form>

      <div className={`report-offcanvas-backdrop ${activeMember ? "is-open" : ""}`} onClick={() => setActiveMemberIndex(null)} />
      <aside className={`report-offcanvas ${activeMember ? "is-open" : ""}`} aria-hidden={!activeMember}>
        <div className="report-offcanvas__header">
          <div>
            <span>Members</span>
            <h2>{activeMemberIndex === null ? "Add Member" : "Edit Member"}</h2>
          </div>
          <button aria-label="Close member editor" onClick={() => setActiveMemberIndex(null)} type="button"><i className="fa fa-times"></i></button>
        </div>
        {activeMember && activeMemberIndex !== null ? (
          <div className="report-offcanvas__body">
            {!isAssociatePage ? (
              <div className="form-group">
                <label>Logo</label>
                <button className="member-logo-picker" data-bs-target="#selectMemberListMediaModal" data-bs-toggle="modal" onClick={() => setSelectedFileFor(`${sectionKey}.members.${activeMemberIndex}.logo`)} type="button">
                  {activeMember.logo ? <img src={addUrlToFile(activeMember.logo)} alt="Member logo" /> : <span>Select logo</span>}
                </button>
              </div>
            ) : (
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" name={`${sectionKey}.members.${activeMemberIndex}.category`} onBlur={handleBlur} onChange={handleChange} value={activeMember.category || "Finished Goods"}>
                  {associateCategories.filter((category) => category !== "All").map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>{isAssociatePage ? "Company Name" : "Name"}</label>
              <input className="form-control" name={`${sectionKey}.members.${activeMemberIndex}.name`} onBlur={handleBlur} onChange={handleChange} placeholder="Company name" value={activeMember.name} />
            </div>
            {isAssociatePage ? (
              <>
                <input className="form-control mb-3" name={`${sectionKey}.members.${activeMemberIndex}.contactPerson`} onBlur={handleBlur} onChange={handleChange} placeholder="Contact person" value={activeMember.contactPerson} />
                <input className="form-control mb-3" name={`${sectionKey}.members.${activeMemberIndex}.designation`} onBlur={handleBlur} onChange={handleChange} placeholder="Designation" value={activeMember.designation} />
              </>
            ) : (
              <div className="form-group">
                <TextareaBox label="Address Lines" name={`${sectionKey}.members.${activeMemberIndex}.addressLines`} handleBlur={() => {}} handleChange={(event) => {
                  void setFieldValue(`${sectionKey}.members.${activeMemberIndex}.addressLines`, event.target.value.split("\n"));
                }} placeholder="One address line per row" value={activeMember.addressLines.join("\n")} touched={false} error={undefined} />
              </div>
            )}
            <div className="form-group">
              <TextareaBox label="Phones" name={`${sectionKey}.members.${activeMemberIndex}.phones`} handleBlur={() => {}} handleChange={(event) => {
                void setFieldValue(`${sectionKey}.members.${activeMemberIndex}.phones`, event.target.value.split("\n"));
            }} placeholder="One phone per row" value={activeMember.phones.join("\n")} touched={false} error={undefined} />
            </div>
            <input className="form-control mb-3" name={`${sectionKey}.members.${activeMemberIndex}.email`} onBlur={handleBlur} onChange={handleChange} placeholder="Email" value={activeMember.email} />
            {!isAssociatePage ? <input className="form-control mb-3" name={`${sectionKey}.members.${activeMemberIndex}.website`} onBlur={handleBlur} onChange={handleChange} placeholder="Website" value={activeMember.website} /> : null}
            <input className="form-control mb-3" name={`${sectionKey}.members.${activeMemberIndex}.sortOrder`} onBlur={handleBlur} onChange={handleChange} placeholder="Sort order" type="number" value={activeMember.sortOrder} />
            <label className="report-toggle">
              <input checked={activeMember.status} onChange={(event) => setFieldValue(`${sectionKey}.members.${activeMemberIndex}.status`, event.target.checked)} type="checkbox" />
              <span>Active</span>
            </label>
          </div>
        ) : null}
        <div className="report-offcanvas__footer">
          <button className="btn btn-light border" onClick={() => setActiveMemberIndex(null)} type="button">Done</button>
        </div>
      </aside>

      <div className="modal fade" id="selectMemberListMediaModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectMemberListMediaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectMemberListMediaModalLabel">Select Media</h1>
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
            <div className="px-3"><Pagination pagination={pagination} setPagination={setPagination} tableName="table-to-xls" csvFileName="media" /></div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary px-3 py-2" data-bs-dismiss="modal">Close</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
