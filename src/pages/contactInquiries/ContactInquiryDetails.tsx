import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { GoBackButton, OverlayLoading } from "../../components";
import { get } from "../../utills";

type ContactInquiryDetailsData = {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  category?: string;
  status?: string;
  message?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function ContactInquiryDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [details, setDetails] = useState<ContactInquiryDetailsData>({});

  useEffect(
    function () {
      async function getData(recordId: string) {
        setLoading(true);
        const apiResponse = await get(`/contact-inquiries/${recordId}`, true);

        if (apiResponse?.status == 200) {
          setDetails(apiResponse.body || {});
        } else {
          toast.error(apiResponse?.message || "Unable to load contact inquiry");
        }

        setLoading(false);
      }

      if (id) getData(id);
    },
    [id],
  );

  const initials = (details.fullName || details.name || "C")
    .charAt(0)
    .toUpperCase();
  const recordId = details._id || details.id || id;
  const displayName = details.fullName || details.name || "-";
  const createdAt = details.createdAt
    ? moment(details.createdAt).format("DD MMM YYYY, hh:mm A")
    : "-";
  const updatedAt = details.updatedAt
    ? moment(details.updatedAt).format("DD MMM YYYY, hh:mm A")
    : "-";

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

  const infoItems: { label: string; value: string; isEmail?: boolean; isCategory?: boolean }[] = [
    { label: "Full Name", value: displayName },
    { label: "Email", value: details.email || "-", isEmail: !!details.email },
    { label: "Phone", value: details.phone || "-" },
    { label: "Company", value: details.company || "-" },
    { label: "Subject", value: details.subject || "-" },
    { label: "Category", value: details.category || "-", isCategory: !!details.category },
    { label: "Created At", value: createdAt },
    { label: "Updated At", value: updatedAt },
  ];

  return (
    <div className="content-wrapper marketplace-admin-page contact-inquiry-details-page">
      {loading ? <OverlayLoading /> : null}

      <div className="marketplace-page-header">
        <div>
          <div className="marketplace-page-header__actions">
            <GoBackButton />
            <span className="marketplace-page-eyebrow">
              Colin McLean
            </span>
          </div>
          <h1>Contact Inquiry Details</h1>
          <p>Review the submitted message, customer context, and internal notes.</p>
        </div>

        {recordId ? (
          <Link
            to={`/admin/contact-inquiries/edit/${recordId}`}
            className="btn marketplace-primary-action"
          >
            <i className="fa fa-pencil-alt me-2" />
            Edit Inquiry
          </Link>
        ) : null}
      </div>

      {!loading ? (
        <>
          <div className="contact-inquiry-details-grid">
            <aside className="contact-inquiry-profile-card">
              <div className="contact-inquiry-avatar">{initials}</div>
              <span
                className={`marketplace-status-pill contact-inquiry-status-pill ${getStatusClass(
                  details.status,
                )}`}
              >
                {details.status || "New"}
              </span>
              <h2>{displayName}</h2>
              <p>
                {details.email ? (
                  <a href={`mailto:${details.email}`} className="text-muted text-decoration-none">
                    {details.email}
                  </a>
                ) : (
                  "No email available"
                )}
              </p>

              <div className="contact-inquiry-profile-meta">
                <span>Category</span>
                <strong>{details.category || "General Inquiry"}</strong>
              </div>

              {details.email ? (
                <a
                  className="contact-inquiry-mail-action"
                  href={`mailto:${details.email}`}
                >
                  <i className="fa fa-envelope" aria-hidden="true" />
                  Email Sender
                </a>
              ) : null}
            </aside>

            <section className="contact-inquiry-info-card">
              <div className="contact-inquiry-section-head">
                <span>Inquiry Info</span>
                <h2>Submitted details</h2>
              </div>

              <div className="contact-inquiry-info-list">
                {infoItems.map((item) => (
                  <div className="contact-inquiry-info-row" key={item.label}>
                    <span>{item.label}</span>
                    {item.isEmail ? (
                      <strong>
                        <a href={`mailto:${item.value}`} className="text-dark">
                          {item.value}
                        </a>
                      </strong>
                    ) : item.isCategory ? (
                      <strong>
                        <span className="badge badge-light border text-dark font-weight-bold">
                          {item.value}
                        </span>
                      </strong>
                    ) : (
                      <strong>{item.value}</strong>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="contact-inquiry-content-grid">
            <section className="contact-inquiry-content-card">
              <div className="contact-inquiry-section-head d-flex justify-content-between align-items-center">
                <div>
                  <span>Customer Message</span>
                  <h2>{details.subject || "Message"}</h2>
                </div>
                {details.category ? (
                  <span className="badge badge-light border text-muted">
                    {details.category}
                  </span>
                ) : null}
              </div>
              <div className="p-3 rounded" style={{ backgroundColor: "#fcfbf8", borderLeft: "3px solid #ebc43d" }}>
                <p>{details.message || "No message content provided."}</p>
              </div>
            </section>

            <section className="contact-inquiry-content-card contact-inquiry-notes-card">
              <div className="contact-inquiry-section-head d-flex justify-content-between align-items-center">
                <div>
                  <span>Internal</span>
                  <h2>Admin Notes</h2>
                </div>
                {recordId ? (
                  <Link
                    to={`/admin/contact-inquiries/edit/${recordId}`}
                    className="btn btn-sm btn-outline-secondary"
                    style={{ borderRadius: "6px" }}
                  >
                    <i className="fa fa-pen me-1" /> Edit Notes
                  </Link>
                ) : null}
              </div>
              {details.adminNotes ? (
                <div className="p-3 rounded bg-white border">
                  <p>{details.adminNotes}</p>
                </div>
              ) : (
                <p className="text-muted font-italic mb-0">
                  No internal notes recorded yet. Use &ldquo;Edit Inquiry&rdquo; to add follow-up notes.
                </p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
