import { FormikHelpers, getIn, useFormik } from "formik";
import { createContext, useContext, useEffect, useState } from "react";
import type { FocusEvent, KeyboardEvent, ReactNode } from "react";
import { toast } from "react-toastify";
import { GoBackButton, OverlayLoading, SubmitButton } from "../../components";
import { get, post, put } from "../../utills";
import {
  contactFaqInitialValue,
  contactOptionInitialValue,
  contactpageInitialValues,
  contactpageSchema,
  ContactPageValues,
  contactSocialLinkInitialValue,
} from "../../validationSchemas/contactpageSchema";

type ContactPageApiData = Partial<ContactPageValues> & {
  id?: string;
  _id?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[] | string;
  };
};

type ContactFormContextValue = {
  getStringValue: (name: string) => string;
  getBooleanValue: (name: string) => boolean;
  setFieldValue: (field: string, value: unknown) => void;
  addArrayItem: <T>(path: string, item: T) => void;
  removeArrayItem: (path: string, index: number) => void;
};

const ContactFormContext = createContext<ContactFormContextValue | null>(null);

const contactIcons = [
  { label: "Email", value: "fa-envelope" },
  { label: "Live Chat", value: "fa-comment" },
  { label: "Help Center", value: "fa-book-open" },
  { label: "Bug Report", value: "fa-bug" },
  { label: "Feature Request", value: "fa-lightbulb" },
  { label: "Documentation", value: "fa-code" },
  { label: "Business", value: "fa-briefcase" },
  { label: "Updates", value: "fa-broadcast-tower" },
  { label: "Video", value: "fa-play" },
  { label: "LinkedIn", value: "fa-brands fa-linkedin-in" },
  { label: "Instagram", value: "fa-brands fa-instagram" },
  { label: "Facebook", value: "fa-brands fa-facebook-f" },
  { label: "YouTube", value: "fa-brands fa-youtube" },
  { label: "WhatsApp", value: "fa-brands fa-whatsapp" },
];

function getIconClass(icon: string | undefined, fallbackIndex = 0) {
  const iconValue = icon || contactIcons[fallbackIndex % contactIcons.length].value;
  return iconValue.includes(" ") ? iconValue : `fa ${iconValue}`;
}

function getIconLabel(icon: string | undefined) {
  return contactIcons.find((item) => item.value === icon)?.label || "Choose icon";
}

function useContactForm() {
  const context = useContext(ContactFormContext);

  if (!context) {
    throw new Error("Contact form context is missing.");
  }

  return context;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeContactValues<T>(initial: T, incoming: unknown): T {
  if (Array.isArray(initial)) {
    return (Array.isArray(incoming) ? incoming : initial) as T;
  }

  if (isPlainObject(initial)) {
    const source = isPlainObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};

    Object.keys(initial).forEach((key) => {
      result[key] = mergeContactValues(initial[key], source[key]);
    });

    return result as T;
  }

  return (incoming === undefined || incoming === null ? initial : incoming) as T;
}

function stripMongoFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripMongoFields);
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce<Record<string, unknown>>(
      (result, [key, item]) => {
        if (
          key === "_id" ||
          key === "id" ||
          key === "__v" ||
          key === "createdAt" ||
          key === "updatedAt" ||
          key === "isDeleted"
        ) {
          return result;
        }

        result[key] = stripMongoFields(item);
        return result;
      },
      {},
    );
  }

  return value;
}

function normalizeKeywords(keywords: string[] | string | undefined) {
  if (Array.isArray(keywords)) return keywords.join(", ");
  return keywords || "";
}

function keywordsToArray(keywords: string) {
  return keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function EditableText({
  className,
  label,
  multiline = false,
  name,
  placeholder,
  tag: Tag = "div",
}: {
  className: string;
  label: string;
  multiline?: boolean;
  name: string;
  placeholder: string;
  tag?: "div" | "span" | "strong" | "small" | "h1" | "h2";
}) {
  const { getStringValue, setFieldValue } = useContactForm();
  const value = getStringValue(name);

  function handleBlur(event: FocusEvent<HTMLElement>) {
    setFieldValue(name, event.currentTarget.textContent?.trim() || "");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!multiline && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  return (
    <Tag
      aria-label={label}
      className={`${className} ${value ? "" : "is-empty"}`}
      contentEditable
      data-placeholder={placeholder}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      role="textbox"
      suppressContentEditableWarning
    >
      {value}
    </Tag>
  );
}

function SmallField({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  const { getStringValue, setFieldValue } = useContactForm();

  return (
    <label className="contact-admin-mini-field">
      <span>{label}</span>
      <input
        className="form-control"
        name={name}
        onChange={(event) => setFieldValue(name, event.target.value)}
        placeholder={placeholder}
        type="text"
        value={getStringValue(name)}
      />
    </label>
  );
}

function ToggleField({ name }: { name: string }) {
  const { getBooleanValue, setFieldValue } = useContactForm();

  return (
    <label className="contact-admin-toggle">
      <input
        checked={getBooleanValue(name)}
        onChange={(event) => setFieldValue(name, event.target.checked)}
        type="checkbox"
      />
      Active
    </label>
  );
}

function AdminCard({
  action,
  children,
  eyebrow,
  eyebrowName,
  title,
  titleName,
}: {
  action?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  eyebrowName?: string;
  title: string;
  titleName?: string;
}) {
  return (
    <section className="contact-admin-card">
      <div className="contact-admin-card__head">
        <div>
          {eyebrowName ? (
            <EditableText
              className="contact-admin-edit"
              label={eyebrow}
              name={eyebrowName}
              placeholder={eyebrow}
              tag="span"
            />
          ) : (
            <span>{eyebrow}</span>
          )}
          {titleName ? (
            <EditableText
              className="contact-admin-edit"
              label={title}
              name={titleName}
              placeholder={title}
              tag="h2"
            />
          ) : (
            <h2>{title}</h2>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function HeroPreview() {
  const { getStringValue } = useContactForm();
  const supportIcon = getStringValue("heroSection.supportIcon");

  return (
    <section className="contact-admin-hero">
      <div className="contact-admin-hero__copy">
        <div className="contact-admin-badge">
          <i className="fa fa-headphones"></i>
          <EditableText
            className="contact-admin-edit contact-admin-badge__text"
            label="Hero eyebrow"
            name="heroSection.eyebrow"
            placeholder="CONTACT SIMPLESELLERS"
          />
        </div>
        <EditableText
          className="contact-admin-edit contact-admin-hero__title"
          label="Hero heading"
          name="heroSection.heading"
          placeholder="Contact Us"
        />
        <EditableText
          className="contact-admin-edit contact-admin-hero__description"
          label="Hero description"
          multiline
          name="heroSection.description"
          placeholder="Need help with IFMA? We're here to answer your questions."
        />
        <SmallField
          label="Support icon"
          name="heroSection.supportIcon"
          placeholder="fa-sparkles"
        />
      </div>

      <div className="contact-admin-hero-card" aria-hidden="true">
        <div className="contact-admin-hero-card__corner"></div>
        <div className="contact-admin-hero-card__icon">
          <i className={getIconClass(supportIcon || "fa-wand-magic-sparkles")}></i>
        </div>
        <span className="contact-admin-line contact-admin-line--one"></span>
        <span className="contact-admin-line contact-admin-line--two"></span>
        <span className="contact-admin-line contact-admin-line--three"></span>
        <div className="contact-admin-routing">
          <span>
            <i className="fa fa-check"></i>
          </span>
          <div>
            <EditableText
              className="contact-admin-edit"
              label="Hero card title"
              name="uiText.heroCardTitle"
              placeholder="Support routing ready"
              tag="strong"
            />
            <EditableText
              className="contact-admin-edit"
              label="Hero card subtitle"
              name="uiText.heroCardSubtitle"
              placeholder="Bugs, support, sales, and ideas"
              tag="small"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactOptionsEditor({
  items,
}: {
  items: ContactPageValues["contactOptions"];
}) {
  const { addArrayItem, removeArrayItem, setFieldValue } = useContactForm();

  return (
    <div className="contact-admin-option-list">
      {items.map((_, index) => (
        <article className="contact-admin-option" key={index}>
          <div className="contact-admin-option__icon">
            <i
              className={getIconClass(items[index].icon, index)}
            ></i>
          </div>
          <div className="contact-admin-option__copy">
            <div className="contact-admin-option__title-row">
              <EditableText
                className="contact-admin-edit contact-admin-option__title"
                label={`Contact option ${index + 1} title`}
                name={`contactOptions.${index}.title`}
                placeholder="Email Support"
              />
              <EditableText
                className="contact-admin-edit contact-admin-option__badge"
                label={`Contact option ${index + 1} badge`}
                name={`contactOptions.${index}.badge`}
                placeholder="COMING SOON"
              />
            </div>
            <EditableText
              className="contact-admin-edit contact-admin-option__value"
              label={`Contact option ${index + 1} value`}
              name={`contactOptions.${index}.value`}
              placeholder="support@ifma.com"
            />
            <EditableText
              className="contact-admin-edit contact-admin-option__description"
              label={`Contact option ${index + 1} description`}
              multiline
              name={`contactOptions.${index}.description`}
              placeholder="Get help with technical issues or general questions."
            />
            <div className="contact-admin-option__fields">
              <SmallField
                label="Href"
                name={`contactOptions.${index}.href`}
                placeholder="mailto:support@ifma.com"
              />
              <label className="contact-admin-mini-field">
                <span>Icon</span>
                <select
                  className="form-control"
                  onChange={(event) =>
                    setFieldValue(`contactOptions.${index}.icon`, event.target.value)
                  }
                  value={items[index].icon}
                >
                  <option value="">Select Icon</option>
                  {contactIcons.map((icon) => (
                    <option value={icon.value} key={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </label>
              <ToggleField name={`contactOptions.${index}.isActive`} />
            </div>
          </div>
          <button
            aria-label="Remove contact option"
            className="contact-admin-remove"
            onClick={() => removeArrayItem("contactOptions", index)}
            type="button"
          >
            <i className="fa fa-times"></i>
          </button>
          <span className="contact-admin-option__arrow">
            <i className="fa fa-chevron-right"></i>
          </span>
        </article>
      ))}
      <button
        className="contact-admin-add"
        onClick={() => addArrayItem("contactOptions", contactOptionInitialValue)}
        type="button"
      >
        <i className="fa fa-plus"></i>
        Add contact option
      </button>
    </div>
  );
}

function BusinessInfoEditor() {
  return (
    <AdminCard
      eyebrow="Business Information"
      eyebrowName="uiText.businessEyebrow"
      title="Support availability"
      titleName="uiText.businessTitle"
    >
      <div className="contact-admin-business-list">
        <div className="contact-admin-business-item">
          <EditableText
            className="contact-admin-edit contact-admin-business-label"
            label="Business hours label"
            name="businessInfo.businessHours.label"
            placeholder="Business Hours"
          />
          <EditableText
            className="contact-admin-edit contact-admin-business-value"
            label="Business days"
            name="businessInfo.businessHours.days"
            placeholder="Monday - Friday"
          />
          <EditableText
            className="contact-admin-edit contact-admin-business-description"
            label="Business time"
            name="businessInfo.businessHours.time"
            placeholder="9:00 AM - 6:00 PM"
          />
        </div>
        <div className="contact-admin-business-item">
          <EditableText
            className="contact-admin-edit contact-admin-business-label"
            label="Timezone label"
            name="businessInfo.timezone.label"
            placeholder="Timezone"
          />
          <EditableText
            className="contact-admin-edit contact-admin-business-value"
            label="Timezone value"
            name="businessInfo.timezone.value"
            placeholder="IST"
          />
          <EditableText
            className="contact-admin-edit contact-admin-business-description"
            label="Timezone description"
            name="businessInfo.timezone.description"
            placeholder="India Standard Time"
          />
        </div>
        <div className="contact-admin-business-item">
          <EditableText
            className="contact-admin-edit contact-admin-business-label"
            label="Response time label"
            name="businessInfo.responseTime.label"
            placeholder="Response Time"
          />
          <EditableText
            className="contact-admin-edit contact-admin-business-value"
            label="Response time value"
            name="businessInfo.responseTime.value"
            placeholder="Usually within 24 hours"
          />
          <EditableText
            className="contact-admin-edit contact-admin-business-description"
            label="Response time description"
            name="businessInfo.responseTime.description"
            placeholder="Priority issues are reviewed first"
          />
        </div>
      </div>
    </AdminCard>
  );
}

function FaqsEditor({ items }: { items: ContactPageValues["faqs"] }) {
  const { addArrayItem, removeArrayItem } = useContactForm();

  return (
    <AdminCard
      action={
        <button
          className="contact-admin-add contact-admin-add--small"
          onClick={() => addArrayItem("faqs", contactFaqInitialValue)}
          type="button"
        >
          <i className="fa fa-plus"></i>
          Add FAQ
        </button>
      }
      eyebrow="FAQ Shortcut"
      eyebrowName="uiText.faqEyebrow"
      title="Quick answers"
      titleName="uiText.faqTitle"
    >
      <div className="contact-admin-faq-list">
        {items.map((_, index) => (
          <div className="contact-admin-faq-item" key={index}>
            <div className="contact-admin-faq-item__top">
              <EditableText
                className="contact-admin-edit contact-admin-faq-question"
                label={`FAQ ${index + 1} question`}
                name={`faqs.${index}.question`}
                placeholder="How long does support take?"
              />
              <ToggleField name={`faqs.${index}.isActive`} />
              <button
                aria-label="Remove FAQ"
                className="contact-admin-remove contact-admin-remove--inline"
                onClick={() => removeArrayItem("faqs", index)}
                type="button"
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            <EditableText
              className="contact-admin-edit contact-admin-faq-answer"
              label={`FAQ ${index + 1} answer`}
              multiline
              name={`faqs.${index}.answer`}
              placeholder="Tell customers what they can expect."
            />
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

function SocialLinksEditor({
  items,
}: {
  items: ContactPageValues["socialLinks"];
}) {
  const { addArrayItem, removeArrayItem, setFieldValue } = useContactForm();

  return (
    <AdminCard
      action={
        <button
          className="contact-admin-add contact-admin-add--small"
          onClick={() => addArrayItem("socialLinks", contactSocialLinkInitialValue)}
          type="button"
        >
          <i className="fa fa-plus"></i>
          Add Social
        </button>
      }
      eyebrow="Social"
      eyebrowName="uiText.socialEyebrow"
      title="Social links"
      titleName="uiText.socialTitle"
    >
      <div className="contact-admin-social-list">
        {items.map((item, index) => (
          <div className="contact-admin-social-item" key={index}>
            <div className="contact-admin-social-top">
              <span className="contact-admin-social-icon">
                <i className={getIconClass(item.icon, 5)}></i>
              </span>
              <div className="contact-admin-social-heading">
                <EditableText
                  className="contact-admin-edit contact-admin-social-label"
                  label={`Social ${index + 1} label`}
                  name={`socialLinks.${index}.label`}
                  placeholder="Docs"
                />
                <span>{getIconLabel(item.icon)}</span>
              </div>
              <ToggleField name={`socialLinks.${index}.isActive`} />
              <button
                aria-label="Remove social link"
                className="contact-admin-remove contact-admin-remove--inline"
                onClick={() => removeArrayItem("socialLinks", index)}
                type="button"
              >
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="contact-admin-social-fields">
              <label className="contact-admin-mini-field contact-admin-mini-field--icon">
                <span>Icon / Platform</span>
                <select
                  className="form-control"
                  onChange={(event) =>
                    setFieldValue(`socialLinks.${index}.icon`, event.target.value)
                  }
                  value={item.icon}
                >
                  <option value="">Choose icon</option>
                  {contactIcons.map((icon) => (
                    <option value={icon.value} key={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </label>
              <SmallField
                label="Link"
                name={`socialLinks.${index}.href`}
                placeholder="https://"
              />
              <SmallField
                label="Badge"
                name={`socialLinks.${index}.badge`}
                placeholder="Optional"
              />
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

function ContactFormPreview() {
  const { getStringValue, setFieldValue } = useContactForm();

  return (
    <aside className="contact-admin-form-preview">
      <div className="contact-admin-form-preview__icon">
        <i className="fa-regular fa-paper-plane"></i>
      </div>
      <EditableText
        className="contact-admin-edit"
        label="Form eyebrow"
        name="uiText.formEyebrow"
        placeholder="Message The Team"
        tag="span"
      />
      <EditableText
        className="contact-admin-edit"
        label="Form heading"
        name="uiText.formHeading"
        placeholder="Tell us what you need"
        tag="h2"
      />
      <div className="contact-admin-form-grid">
        <label>
          <EditableText
            className="contact-admin-edit"
            label="Full name label"
            name="uiText.fullNameLabel"
            placeholder="Full Name"
            tag="span"
          />
          <input readOnly />
        </label>
        <label>
          <EditableText
            className="contact-admin-edit"
            label="Email label"
            name="uiText.emailLabel"
            placeholder="Email Address"
            tag="span"
          />
          <input readOnly />
        </label>
        <label>
          <EditableText
            className="contact-admin-edit"
            label="Company label"
            name="uiText.companyLabel"
            placeholder="Company"
            tag="span"
          />
          <em>
            <EditableText
              className="contact-admin-edit"
              label="Company optional label"
              name="uiText.companyOptionalLabel"
              placeholder="(Optional)"
              tag="span"
            />
          </em>
          <input readOnly />
        </label>
        <label>
          <EditableText
            className="contact-admin-edit"
            label="Subject label"
            name="uiText.subjectLabel"
            placeholder="Subject"
            tag="span"
          />
          <input readOnly />
        </label>
      </div>
      <label className="contact-admin-form-wide">
        <EditableText
          className="contact-admin-edit"
          label="Category label"
          name="uiText.categoryLabel"
          placeholder="Category"
          tag="span"
        />
        <select disabled>
          <option>{getStringValue("uiText.categoryDefaultOption")}</option>
        </select>
      </label>
      <SmallField
        label="Default category option"
        name="uiText.categoryDefaultOption"
        placeholder="General Inquiry"
      />
      <textarea
        onChange={(event) =>
          setFieldValue("uiText.messagePlaceholder", event.target.value)
        }
        value={getStringValue("uiText.messagePlaceholder")}
      />
      <div className="contact-admin-form-help">
        <strong>
          <i className="fa-regular fa-circle-check"></i>
          <EditableText
            className="contact-admin-edit"
            label="Form help title"
            name="uiText.formHelpTitle"
            placeholder="Helpful context gets faster replies"
            tag="span"
          />
        </strong>
        <EditableText
          className="contact-admin-edit"
          label="Form counter text"
          name="uiText.formCounterText"
          placeholder="0/1000"
          tag="span"
        />
      </div>
      <button type="button">
        <i className="fa-regular fa-paper-plane"></i>
        <EditableText
          className="contact-admin-edit"
          label="Form submit button text"
          name="uiText.formSubmitButtonText"
          placeholder="Send Message"
          tag="span"
        />
      </button>
      <EditableText
        className="contact-admin-edit"
        label="Form footnote"
        multiline
        name="uiText.formFootnote"
        placeholder="This form opens your email app. No backend submission endpoint is used."
        tag="small"
      />
    </aside>
  );
}

function SeoEditor() {
  const { getStringValue, setFieldValue } = useContactForm();

  return (
    <AdminCard
      eyebrow="SEO"
      eyebrowName="uiText.seoEyebrow"
      title="Search metadata"
      titleName="uiText.seoTitle"
    >
      <div className="contact-admin-seo">
        <label>
          Meta Title
          <input
            className="form-control"
            onChange={(event) => setFieldValue("seo.metaTitle", event.target.value)}
            type="text"
            value={getStringValue("seo.metaTitle")}
          />
        </label>
        <label>
          Meta Description
          <textarea
            className="form-control"
            onChange={(event) =>
              setFieldValue("seo.metaDescription", event.target.value)
            }
            value={getStringValue("seo.metaDescription")}
          />
        </label>
        <label>
          Keywords
          <textarea
            className="form-control"
            onChange={(event) => setFieldValue("seo.keywords", event.target.value)}
            placeholder="keyword one, keyword two"
            value={getStringValue("seo.keywords")}
          />
        </label>
      </div>
    </AdminCard>
  );
}

export function ContactPageContent() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [contentId, setContentId] = useState<string>("");

  const {
    values,
    handleSubmit,
    setFieldValue,
    setValues,
  } = useFormik<ContactPageValues>({
    initialValues: contactpageInitialValues,
    validationSchema: contactpageSchema,
    onSubmit: async (
      formValues: ContactPageValues,
      helpers: FormikHelpers<ContactPageValues>,
    ) => {
      setSaving(true);

      const payload = {
        ...formValues,
        seo: {
          ...formValues.seo,
          keywords: keywordsToArray(formValues.seo.keywords),
        },
      };

      const apiResponse = contentId
        ? await put(`/contactpage/${contentId}`, payload)
        : await post("/contactpage", payload, true);

      if (apiResponse?.status == 200) {
        const savedId = apiResponse?.body?._id || apiResponse?.body?.id;
        if (savedId) setContentId(savedId);
        toast.success(apiResponse?.message || "Contact page content saved");
      } else {
        helpers.setErrors(apiResponse?.errors || {});
        toast.error(apiResponse?.message || "Unable to save contact page");
      }

      setSaving(false);
    },
  });

  useEffect(function () {
    async function getData() {
      setLoading(true);
      const apiResponse = await get("/contactpage", true);

      if (apiResponse?.status == 200) {
        const apiData: ContactPageApiData = apiResponse.body || {};
        const id = apiData._id || apiData.id || "";
        const cleanData = stripMongoFields(apiData) as ContactPageApiData;
        const mergedValues = mergeContactValues(contactpageInitialValues, {
          ...cleanData,
          seo: {
            ...cleanData.seo,
            keywords: normalizeKeywords(cleanData.seo?.keywords),
          },
        });

        setContentId(id);
        setValues(mergedValues);
      } else if (apiResponse?.message) {
        toast.error(apiResponse.message);
      }

      setLoading(false);
    }

    getData();
  }, [setValues]);

  const contextValue: ContactFormContextValue = {
    getStringValue: (name) => {
      const value = getIn(values, name);
      if (value === undefined || value === null) return "";
      return String(value);
    },
    getBooleanValue: (name) => Boolean(getIn(values, name)),
    setFieldValue: (field, value) => {
      void setFieldValue(field, value);
    },
    addArrayItem: (path, item) => {
      const currentValue = getIn(values, path);
      const currentItems = Array.isArray(currentValue) ? currentValue : [];
      void setFieldValue(path, [...currentItems, item]);
    },
    removeArrayItem: (path, index) => {
      const currentValue = getIn(values, path);
      const currentItems = Array.isArray(currentValue) ? currentValue : [];
      void setFieldValue(
        path,
        currentItems.filter((_, itemIndex) => itemIndex !== index),
      );
    },
  };

  return (
    <ContactFormContext.Provider value={contextValue}>
      <form className="contact-admin-page" onSubmit={handleSubmit}>
        {loading ? <OverlayLoading /> : null}

        <header className="contact-admin-page__header">
          <div>
            <div className="contact-admin-page__actions">
              <GoBackButton />
              <EditableText
                className="contact-admin-edit"
                label="Header badge"
                name="uiText.headerBadge"
                placeholder="Contact Page CMS"
                tag="span"
              />
            </div>
            <EditableText
              className="contact-admin-edit contact-admin-page-title"
              label="Header title"
              name="uiText.headerTitle"
              placeholder="Contact Page"
              tag="h1"
            />
            <EditableText
              className="contact-admin-edit"
              label="Header description"
              multiline
              name="uiText.headerDescription"
              placeholder="Edit the public contact page in the same visual layout customers see."
            />
          </div>
          <div className="contact-admin-page__meta">
            <span>{contentId ? "Editing saved content" : "Creating content"}</span>
            <SubmitButton
              loading={saving}
              text={contentId ? "Update Contact Page" : "Create Contact Page"}
            />
          </div>
        </header>

        <HeroPreview />

        <main className="contact-admin-layout">
          <div className="contact-admin-left">
            <ContactOptionsEditor items={values.contactOptions} />
            <BusinessInfoEditor />
            <FaqsEditor items={values.faqs} />
            <SocialLinksEditor items={values.socialLinks} />
            <SeoEditor />
          </div>
          <ContactFormPreview />
        </main>

        <div className="contact-admin-sticky-actions">
          <div>
            <EditableText
              className="contact-admin-edit"
              label="Sticky title"
              name="uiText.stickyTitle"
              placeholder="Contact page changes"
              tag="strong"
            />
            <EditableText
              className="contact-admin-edit"
              label="Sticky description"
              name="uiText.stickyDescription"
              placeholder="Inline edits save to the Contact Page CMS API."
              tag="span"
            />
          </div>
          <SubmitButton
            loading={saving}
            text={contentId ? "Update Contact Page" : "Create Contact Page"}
          />
        </div>
      </form>
    </ContactFormContext.Provider>
  );
}
