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

  const infoItems = [
    { label: "Full Name", value: displayName },
    { label: "Email", value: details.email || "-" },
    { label: "Company", value: details.company || "-" },
    { label: "Subject", value: details.subject || "-" },
    { label: "Category", value: details.category || "-" },
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
              IFMA Workspace
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
                {details.status || "-"}
              </span>
              <h2>{displayName}</h2>
              <p>{details.email || "No email available"}</p>

              <div className="contact-inquiry-profile-meta">
                <span>Category</span>
                <strong>{details.category || "-"}</strong>
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
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="contact-inquiry-content-grid">
            <section className="contact-inquiry-content-card">
              <div className="contact-inquiry-section-head">
                <span>Customer Message</span>
                <h2>{details.subject || "Message"}</h2>
              </div>
              <p>{details.message || "-"}</p>
            </section>

            <section className="contact-inquiry-content-card contact-inquiry-notes-card">
              <div className="contact-inquiry-section-head">
                <span>Internal</span>
                <h2>Admin Notes</h2>
              </div>
              <p>{details.adminNotes || "-"}</p>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
