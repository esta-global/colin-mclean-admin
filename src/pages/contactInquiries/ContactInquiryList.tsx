import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { GoBackButton, OverlayLoading, Pagination } from "../../components";
import { deleteConfirmation, get, remove } from "../../utills";
import {
  contactInquiryCategories,
  contactInquiryStatuses,
} from "../../validationSchemas/contactInquirySchema";

type ContactInquiry = {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  category?: string;
  status?: string;
  message?: string;
  createdAt?: string;
};

export function ContactInquiryList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const [records, setRecords] = useState<ContactInquiry[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
          sort,
        });

        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (status) params.set("status", status);

        const apiResponse = await get(`/contact-inquiries?${params}`, true);

        if (apiResponse?.status == 200) {
          const body = apiResponse.body || {};
          const paginationData = body.pagination || {};
          setRecords(Array.isArray(body.items) ? body.items : []);
          setPagination((old) => ({
            ...old,
            page: paginationData.page || 1,
            limit: paginationData.limit || old.limit,
            totalPages: paginationData.totalPages || 0,
            totalRecords: paginationData.totalItems || 0,
          }));
        } else {
          setRecords([]);
          toast.error(apiResponse?.message || "Unable to load contact inquiries");
        }

        setLoading(false);
      }

      getData();
    },
    [pagination.page, pagination.limit, search, category, status, sort, needReload],
  );

  async function handleDeleteData(recordId: string) {
    const { isConfirmed } = await deleteConfirmation(
      "Do you want to delete this contact inquiry?",
    );

    if (!isConfirmed) return;

    const apiResponse = await remove(`/contact-inquiries/${recordId}`);

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message || "Contact inquiry deleted");
      setNeedReload((old) => !old);
    } else {
      toast.error(apiResponse?.message || "Unable to delete contact inquiry");
    }
  }

  function handleFilterChange(
    setter: (value: string) => void,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setter(event.target.value);
    setPagination((old) => ({ ...old, page: 1 }));
  }

  function getStatusClass(value: string | undefined) {
    const normalizedValue = String(value || "").toLowerCase();

    if (normalizedValue === "resolved" || normalizedValue === "closed") {
      return "is-active";
    }

    if (normalizedValue === "in progress" || normalizedValue === "pending") {
      return "is-pending";
    }

    return "is-new";
  }

  return (
    <div className="content-wrapper marketplace-admin-page contact-inquiry-admin-page">
      {loading ? <OverlayLoading /> : null}

      <div className="marketplace-page-header">
        <div>
          <div className="marketplace-page-header__actions">
            <GoBackButton />
            <span className="marketplace-page-eyebrow">
              IFMA Workspace
            </span>
          </div>
          <h1>Contact Inquiries</h1>
          <p>Review customer messages, route follow-ups, and track inquiry status.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card marketplace-table-card">
            <div className="marketplace-toolbar contact-inquiry-toolbar">
              <div className="marketplace-search-wrap">
                <i className="ti-search"></i>
                <input
                  placeholder="Search name, email, subject, or message"
                  className="form-control"
                  type="search"
                  value={search}
                  onChange={(event) => handleFilterChange(setSearch, event)}
                />
              </div>

              <div className="marketplace-toolbar-actions contact-inquiry-filters">
                <select
                  className="form-control marketplace-status-select"
                  value={category}
                  onChange={(event) => handleFilterChange(setCategory, event)}
                  aria-label="Filter inquiries by category"
                >
                  <option value="">All Categories</option>
                  {contactInquiryCategories.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  className="form-control marketplace-status-select"
                  value={status}
                  onChange={(event) => handleFilterChange(setStatus, event)}
                  aria-label="Filter inquiries by status"
                >
                  <option value="">All Statuses</option>
                  {contactInquiryStatuses.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  className="form-control marketplace-status-select contact-inquiry-sort"
                  value={sort}
                  onChange={(event) => handleFilterChange(setSort, event)}
                  aria-label="Sort inquiries"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            <div className="card-body shadow-none">
              <div className="table-responsive marketplace-table-wrap contact-inquiry-table-wrap">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Company</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => {
                        const recordId = record._id || record.id || "";
                        return (
                          <tr key={recordId}>
                            <td>
                              <div className="marketplace-name-cell">
                                <strong>{record.fullName || record.name || "-"}</strong>
                                <span>{record.company || "No company"}</span>
                              </div>
                            </td>
                            <td className="contact-inquiry-muted-cell">
                              {record.email || "-"}
                            </td>
                            <td>{record.company || "-"}</td>
                            <td>{record.subject || "-"}</td>
                            <td>{record.category || "-"}</td>
                            <td>
                              <span
                                className={`marketplace-status-pill contact-inquiry-status-pill ${getStatusClass(
                                  record.status,
                                )}`}
                              >
                                {record.status || "-"}
                              </span>
                            </td>
                            <td>
                              {record.createdAt
                                ? moment(record.createdAt).format(
                                    "DD MMM YYYY, hh:mm A",
                                  )
                                : "-"}
                            </td>
                            <td>
                              <div className="marketplace-action-cell">
                                <Link
                                  className="marketplace-icon-action"
                                  to={`/admin/contact-inquiries/details/${recordId}`}
                                  title="View inquiry"
                                >
                                  <span className="fas fa-eye" aria-hidden="true" />
                                </Link>
                                <Link
                                  className="marketplace-icon-action"
                                  to={`/admin/contact-inquiries/edit/${recordId}`}
                                  title="Edit inquiry"
                                >
                                  <span
                                    className="fas fa-pencil-alt"
                                    aria-hidden="true"
                                  />
                                </Link>
                                <button
                                  type="button"
                                  className="btn marketplace-icon-action marketplace-icon-action--danger"
                                  onClick={() => handleDeleteData(recordId)}
                                  title="Delete inquiry"
                                >
                                  <span
                                    className="fas fa-trash-alt text-danger"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="text-center" colSpan={8}>
                          No contact inquiries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="marketplace-pagination-wrap">
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName="contact-inquiries-table"
                  csvFileName="contact-inquiries"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
