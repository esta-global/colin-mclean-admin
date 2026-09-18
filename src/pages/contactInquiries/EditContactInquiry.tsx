import { FormikHelpers, useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  GoBackButton,
  InputBox,
  OverlayLoading,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { get, put } from "../../utills";
import {
  contactInquiryCategories,
  contactInquiryInitialValues,
  contactInquirySchema,
  contactInquiryStatuses,
  ContactInquiryValues,
} from "../../validationSchemas/contactInquirySchema";

type ContactInquiryApiData = Partial<ContactInquiryValues> & {
  fullName?: string;
  name?: string;
  email?: string;
  company?: string;
};

export function EditContactInquiry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [readOnlyInfo, setReadOnlyInfo] = useState<ContactInquiryApiData>({});

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setValues,
  } = useFormik<ContactInquiryValues>({
    initialValues: contactInquiryInitialValues,
    validationSchema: contactInquirySchema,
    onSubmit: async (
      formValues: ContactInquiryValues,
      helpers: FormikHelpers<ContactInquiryValues>,
    ) => {
      setSaving(true);

      const apiResponse = await put(`/contact-inquiries/${id}`, formValues);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message || "Contact inquiry updated");
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors || {});
        toast.error(apiResponse?.message || "Unable to update contact inquiry");
      }

      setSaving(false);
    },
  });

  const displayName = readOnlyInfo.fullName || readOnlyInfo.name || "-";
  const initials = displayName.charAt(0).toUpperCase();

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

  useEffect(
    function () {
      async function getData(recordId: string) {
        setLoading(true);
        const apiResponse = await get(`/contact-inquiries/${recordId}`, true);

        if (apiResponse?.status == 200) {
          const apiData: ContactInquiryApiData = apiResponse.body || {};
          setReadOnlyInfo(apiData);
          setValues({
            status: apiData.status || "",
            adminNotes: apiData.adminNotes || "",
            category: apiData.category || "",
            subject: apiData.subject || "",
            message: apiData.message || "",
          });
        } else {
          toast.error(apiResponse?.message || "Unable to load contact inquiry");
        }

        setLoading(false);
      }

      if (id) getData(id);
    },
    [id, setValues],
  );

  return (
    <div className="content-wrapper marketplace-admin-page contact-inquiry-edit-page">
      {loading ? <OverlayLoading /> : null}

      <div className="marketplace-page-header">
        <div>
          <div className="marketplace-page-header__actions">
            <GoBackButton />
            <span className="marketplace-page-eyebrow">
              Colin McLean
            </span>
          </div>
          <h1>Update Contact Inquiry</h1>
          <p>Manage inquiry status, message details, and internal admin notes.</p>
        </div>

        {id ? (
          <Link
            className="btn marketplace-primary-action"
            to={`/admin/contact-inquiries/details/${id}`}
          >
            View Details
          </Link>
        ) : null}
      </div>

      <form className="forms-sample contact-inquiry-edit-form" onSubmit={handleSubmit}>
        <div className="contact-inquiry-edit-layout">
          <main className="contact-inquiry-edit-main">
            <section className="contact-inquiry-edit-card">
              <div className="contact-inquiry-section-head">
                <span>Inquiry Update</span>
                <h2>Status and routing</h2>
              </div>

              <div className="contact-inquiry-form-grid">
                <div className="form-group">
                  <label className="contact-inquiry-field-label" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-control"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select Status</option>
                    {contactInquiryStatuses.map((item) => (
                      <option value={item} key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.status && touched.status ? (
                    <p className="custom-form-error text-danger">{errors.status}</p>
                  ) : null}
                </div>

                <div className="form-group">
                  <label className="contact-inquiry-field-label" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-control"
                    value={values.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select Category</option>
                    {contactInquiryCategories.map((item) => (
                      <option value={item} key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.category && touched.category ? (
                    <p className="custom-form-error text-danger">
                      {errors.category}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="form-group">
                <InputBox
                  label="Subject"
                  name="subject"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  type="text"
                  value={values.subject}
                  required={true}
                  error={errors.subject}
                  touched={touched.subject}
                />
              </div>
            </section>

            <section className="contact-inquiry-edit-card">
              <div className="contact-inquiry-section-head">
                <span>Customer Message</span>
                <h2>Message content</h2>
              </div>

              <div className="form-group">
                <TextareaBox
                  label="Message"
                  name="message"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.message}
                  error={errors.message}
                  touched={touched.message}
                />
              </div>
            </section>

            <section className="contact-inquiry-edit-card">
              <div className="contact-inquiry-section-head">
                <span>Internal</span>
                <h2>Admin notes</h2>
              </div>

              <div className="form-group">
                <TextareaBox
                  label="Admin Notes"
                  name="adminNotes"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  value={values.adminNotes}
                  error={errors.adminNotes}
                  touched={touched.adminNotes}
                />
              </div>
            </section>

            <div className="contact-inquiry-edit-sticky-actions">
              <div>
                <strong>Save inquiry updates</strong>
                <span>Status, category, message, and admin notes will be updated.</span>
              </div>
              <SubmitButton loading={saving} text="Update Inquiry" />
            </div>
          </main>

          <aside className="contact-inquiry-edit-side">
            <section className="contact-inquiry-profile-card contact-inquiry-edit-profile">
              <div className="contact-inquiry-avatar">{initials}</div>
              <span
                className={`marketplace-status-pill contact-inquiry-status-pill ${getStatusClass(
                  values.status,
                )}`}
              >
                {values.status || "No status"}
              </span>
              <h2>{displayName}</h2>
              <p>{readOnlyInfo.email || "No email available"}</p>

              <div className="contact-inquiry-profile-meta">
                <span>Company</span>
                <strong>{readOnlyInfo.company || "-"}</strong>
              </div>

              {readOnlyInfo.email ? (
                <a
                  className="contact-inquiry-mail-action"
                  href={`mailto:${readOnlyInfo.email}`}
                >
                  <i className="fa fa-envelope" aria-hidden="true" />
                  Email Sender
                </a>
              ) : null}
            </section>

            <section className="contact-inquiry-edit-card contact-inquiry-edit-checklist">
              <div className="contact-inquiry-section-head">
                <span>Checklist</span>
                <h2>Before saving</h2>
              </div>
              <ul>
                <li>
                  <i className="fa fa-check" aria-hidden="true" />
                  Confirm the right inquiry status.
                </li>
                <li>
                  <i className="fa fa-check" aria-hidden="true" />
                  Keep customer message context accurate.
                </li>
                <li>
                  <i className="fa fa-check" aria-hidden="true" />
                  Add internal notes for the next admin.
                </li>
              </ul>
            </section>
          </aside>
        </div>
          </form>
    </div>
  );
}
