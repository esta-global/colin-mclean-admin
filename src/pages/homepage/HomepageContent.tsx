import {
  GoBackButton,
  InputBox,
  OverlayLoading,
  Pagination,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, getIn, useFormik } from "formik";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, ReactNode } from "react";
import { toast } from "react-toastify";

import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";
import { get, post } from "../../utills";
import {
  HomepageValues,
  createEmptyAiProcessStep,
  createEmptyTrustedByLogo,
  createEmptyTrustItem,
  createEmptyUploadPreview,
  createEmptyVideoItem,
  homepageInitialValues,
  homepageSchema,
} from "../../validationSchemas/homepageSchema";

type MediaRecord = {
  _id?: string;
  filename: string;
};

type FieldInputProps = {
  label: string;
  name: string;
  placeholder?: string;
  col?: string;
  type?: "text" | "email" | "tel" | "date" | "password" | "url";
};

const HERO_UPLOAD_PREVIEW_LIMIT = 4;
const HERO_TRUST_ITEMS_LIMIT = 3;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeHomepageValues<T>(initial: T, incoming: unknown): T {
  if (Array.isArray(initial)) {
    return (Array.isArray(incoming) ? incoming : initial) as T;
  }

  if (isPlainObject(initial)) {
    const source = isPlainObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};

    Object.keys(initial).forEach((key) => {
      result[key] = mergeHomepageValues(initial[key], source[key]);
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

function getFixedUploadPreviews(
  items: HomepageValues["heroSection"]["uploadPreview"],
): HomepageValues["heroSection"]["uploadPreview"] {
  return Array.from({ length: HERO_UPLOAD_PREVIEW_LIMIT }, (_, index) => ({
    ...createEmptyUploadPreview(),
    ...(items[index] || {}),
  }));
}

function getFixedTrustItems(
  items: HomepageValues["heroSection"]["trustItems"],
): HomepageValues["heroSection"]["trustItems"] {
  return Array.from({ length: HERO_TRUST_ITEMS_LIMIT }, (_, index) => ({
    ...createEmptyTrustItem(),
    ...(items[index] || {}),
  }));
}

function normalizeHomepageValues(values: HomepageValues): HomepageValues {
  return values;
}

type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
type TextareaChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => void;
type InputBlurHandler = (event: FocusEvent<HTMLInputElement>) => void;
type TextareaBlurHandler = (event: FocusEvent<HTMLTextAreaElement>) => void;

type HomepageFormContextValue = {
  handleBlur: InputBlurHandler & TextareaBlurHandler;
  handleChange: InputChangeHandler & TextareaChangeHandler;
  setFieldValue: (field: string, value: unknown) => void;
  setSelectedFileFor: (field: string) => void;
  getFieldValue: (name: string) => unknown;
  getStringValue: (name: string) => string;
  getNumberValue: (name: string) => number;
  getError: (name: string) => string | undefined;
  getTouched: (name: string) => boolean;
  getArray: <T>(path: string) => T[];
  addArrayItem: <T>(path: string, item: T) => void;
  removeArrayItem: (path: string, index: number) => void;
  moveArrayItem: (path: string, fromIndex: number, toIndex: number) => void;
};

const HomepageFormContext = createContext<HomepageFormContextValue | null>(null);

function useHomepageForm() {
  const context = useContext(HomepageFormContext);

  if (!context) {
    throw new Error("Homepage form context is missing.");
  }

  return context;
}

function FieldInput({
  label,
  name,
  placeholder,
  col = "col-md-6",
  type = "text",
}: FieldInputProps) {
  const { handleBlur, handleChange, getStringValue, getTouched, getError } =
    useHomepageForm();

  return (
    <div className={col}>
      <div className="form-group">
        <InputBox
          label={label}
          name={name}
          handleBlur={handleBlur}
          handleChange={handleChange}
          type={type}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          value={getStringValue(name)}
          required={false}
          touched={getTouched(name)}
          error={getError(name)}
        />
      </div>
    </div>
  );
}

function TextAreaInput({
  label,
  name,
  placeholder,
  col = "col-md-12",
}: FieldInputProps) {
  const { handleBlur, handleChange, getStringValue, getTouched, getError } =
    useHomepageForm();

  return (
    <div className={col}>
      <div className="form-group">
        <TextareaBox
          label={label}
          name={name}
          handleBlur={handleBlur}
          handleChange={handleChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          value={getStringValue(name)}
          touched={getTouched(name)}
          error={getError(name)}
        />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="card homepage-section-card">
      <div className="card-body">
        <div className="homepage-section-heading">
          <span>Homepage</span>
          <h2>{title}</h2>
        </div>
        <div className="row">
          {children}
        </div>
      </div>
    </div>
  );
}

function HeroContentEditor() {
  const { handleBlur, handleChange, getArray, getStringValue } = useHomepageForm();
  const trustItemsPath = "heroSection.trustItems";
  const items = getFixedTrustItems(
    getArray<HomepageValues["heroSection"]["trustItems"][number]>(trustItemsPath),
  );

  return (
    <SectionCard title="Hero Section">
      <div className="col-md-12">
        <div className="homepage-copy-editor">
          <div className="homepage-copy-editor__preview">
            <div className="homepage-copy-badge">
              <span>+</span>
              <EditableContent
                className="homepage-copy-input homepage-copy-input--badge"
                label="Hero badge text"
                name="heroSection.badge.text"
                placeholder="AI-POWERED LISTING GENERATOR"
              />
            </div>

            <div className="homepage-copy-heading">
              <EditableContent
                className="homepage-copy-input homepage-copy-input--heading"
                label="Hero heading line 1"
                multiline
                name="heroSection.heading.line1"
                placeholder="Selling online"
              />
              <div className="homepage-copy-heading__line">
                <EditableContent
                  className="homepage-copy-input homepage-copy-input--heading homepage-copy-input--highlight"
                  label="Hero heading highlight"
                  multiline
                  name="heroSection.heading.highlight"
                  placeholder="simple."
                />
              </div>
            </div>

            <EditableContent
              className="homepage-copy-input homepage-copy-input--description"
              label="Hero description"
              multiline
              name="heroSection.description"
              placeholder="Upload photos and generate marketplace-ready listings in seconds with AI."
            />

            <div className="homepage-copy-actions">
              <div className="homepage-copy-button-block">
                <input
                  aria-label="Primary button text"
                  className="homepage-copy-input homepage-copy-button homepage-copy-button--primary"
                  name="heroSection.buttons.primary.text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Start Free"
                  value={getStringValue("heroSection.buttons.primary.text")}
                />
                <input
                  aria-label="Primary button URL"
                  className="homepage-copy-input homepage-copy-url"
                  name="heroSection.buttons.primary.url"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Primary button URL"
                  value={getStringValue("heroSection.buttons.primary.url")}
                />
              </div>

              <div className="homepage-copy-button-block">
                <input
                  aria-label="Secondary button text"
                  className="homepage-copy-input homepage-copy-button homepage-copy-button--secondary"
                  name="heroSection.buttons.secondary.text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Watch Demo"
                  value={getStringValue("heroSection.buttons.secondary.text")}
                />
                <input
                  aria-label="Secondary button URL"
                  className="homepage-copy-input homepage-copy-url"
                  name="heroSection.buttons.secondary.url"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Secondary button URL"
                  value={getStringValue("heroSection.buttons.secondary.url")}
                />
              </div>
            </div>

            <div className="homepage-copy-trust">
              {items.map((item, index) => {
                const name = `${trustItemsPath}.${index}.text`;

                return (
                  <label className="homepage-copy-trust__item" key={name}>
                    <i className="fa fa-check"></i>
                    <EditableContent
                      className="homepage-copy-input homepage-copy-input--trust"
                      label={`Trust item ${index + 1}`}
                      name={name}
                      placeholder={
                        index === 0
                          ? "No credit card required"
                          : index === 1
                            ? "Free to start"
                            : "Cancel anytime"
                      }
                      valueFallback={item.text}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function EditableContent({
  className,
  label,
  multiline = false,
  name,
  placeholder,
  valueFallback = "",
}: {
  className: string;
  label: string;
  multiline?: boolean;
  name: string;
  placeholder: string;
  valueFallback?: string;
}) {
  const { getStringValue, setFieldValue } = useHomepageForm();
  const value = getStringValue(name) || valueFallback;

  return (
    <div
      aria-label={label}
      className={`${className} ${value ? "" : "is-empty"}`}
      contentEditable
      data-placeholder={placeholder}
      onBlur={(event) => {
        setFieldValue(name, event.currentTarget.textContent?.trim() || "");
      }}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      role="textbox"
      suppressContentEditableWarning
    >
      {value}
    </div>
  );
}

function HeroEditablePreview() {
  const {
    handleBlur,
    handleChange,
    getArray,
    getStringValue,
    getNumberValue,
    getFieldValue,
    getTouched,
    getError,
    setFieldValue,
    setSelectedFileFor,
    addArrayItem,
    removeArrayItem,
  } = useHomepageForm();

  const uploadPath = "heroSection.uploadPreview";
  const aiStepsPath = "heroSection.aiProcess.steps";
  const listingFeaturesPath = "heroSection.listingPreview.features";
  const uploadItems = getFixedUploadPreviews(
    getArray<HomepageValues["heroSection"]["uploadPreview"][number]>(uploadPath),
  );
  const aiSteps = getArray<HomepageValues["heroSection"]["aiProcess"]["steps"][number]>(
    aiStepsPath,
  );
  const listingFeatures = getArray<string>(listingFeaturesPath);
  const progress = Math.max(
    0,
    Math.min(100, getNumberValue("heroSection.aiProcess.progress") || 0),
  );
  const productImage = getStringValue("heroSection.listingPreview.productImage");

  return (
    <SectionCard title="Hero Visual Preview">
      <div className="col-md-12">
        <div className="homepage-hero-editor">
          <div className="homepage-hero-editor__stage">
            <div className="homepage-front-card homepage-front-card--upload">
              <EditableMiniInput
                label="Upload photos title"
                name="heroSection.uploadPreviewTitle"
                fallback="Upload photos"
                className="homepage-front-card__title"
              />
              <div className="homepage-front-upload-grid">
                {uploadItems.map((item, index) => {
                  const imageName = `${uploadPath}.${index}.image`;
                  const titleName = `${uploadPath}.${index}.title`;
                  const image = getStringValue(imageName) || item.image;

                  return (
                    <div className="homepage-front-upload-tile" key={`${uploadPath}-${index}`}>
                      <button
                        type="button"
                        className="homepage-front-image-button"
                        data-bs-toggle="modal"
                        data-bs-target="#selectImageFileModal"
                        onClick={() => setSelectedFileFor(imageName)}
                        title={`Change upload image ${index + 1}`}
                      >
                        <img
                          src={image ? addUrlToFile(image) : "/images/select-photo.png"}
                          alt={getStringValue(titleName) || item.title || `Upload ${index + 1}`}
                        />
                      </button>
                      <input
                        aria-label={`Upload preview ${index + 1} title`}
                        className="homepage-inline-field homepage-inline-field--tiny"
                        name={titleName}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder={`Preview ${index + 1}`}
                        value={getStringValue(titleName) || item.title}
                      />
                      {image ? (
                        <button
                          type="button"
                          className="homepage-front-clear"
                          aria-label={`Clear upload image ${index + 1}`}
                          onClick={() => setFieldValue(imageName, "")}
                        >
                          <i className="fa fa-times"></i>
                        </button>
                      ) : null}
                      {getTouched(titleName) && getError(titleName) ? (
                        <p className="custom-form-error text-danger mb-0">
                          {getError(titleName)}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <span className="homepage-front-arrow">&rarr;</span>

            <div className="homepage-front-card homepage-front-card--process">
              <EditableMiniInput
                label="AI process title"
                name="heroSection.aiProcess.title"
                fallback="Generating with AI"
                className="homepage-front-card__title"
              />
              <div className="homepage-front-steps">
                {aiSteps.map((step, index) => {
                  const labelName = `${aiStepsPath}.${index}.label`;
                  const completedName = `${aiStepsPath}.${index}.completed`;

                  return (
                    <div className="homepage-front-step-row" key={`${aiStepsPath}-${index}`}>
                      <input
                        aria-label={`AI process step ${index + 1}`}
                        className="homepage-inline-field"
                        name={labelName}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="Step label"
                        value={getStringValue(labelName) || step.label}
                      />
                      <button
                        type="button"
                        className={`homepage-front-check ${getFieldValue(completedName) ? "is-complete" : ""
                          }`}
                        aria-label={`Toggle step ${index + 1}`}
                        onClick={() => setFieldValue(completedName, !getFieldValue(completedName))}
                      >
                        <i className="fa fa-check"></i>
                      </button>
                      <button
                        type="button"
                        className="homepage-front-row-remove"
                        aria-label={`Remove step ${index + 1}`}
                        onClick={() => removeArrayItem(aiStepsPath, index)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="homepage-front-process-tools">
                <input
                  aria-label="AI process progress"
                  className="homepage-inline-field homepage-inline-field--number"
                  name="heroSection.aiProcess.progress"
                  onBlur={handleBlur}
                  onChange={(event) =>
                    setFieldValue(
                      "heroSection.aiProcess.progress",
                      event.target.value === "" ? 0 : Number(event.target.value),
                    )
                  }
                  type="number"
                  min="0"
                  max="100"
                  value={getNumberValue("heroSection.aiProcess.progress")}
                />
                <button
                  type="button"
                  className="homepage-front-add"
                  onClick={() => addArrayItem(aiStepsPath, createEmptyAiProcessStep())}
                >
                  + Step
                </button>
              </div>
              <div className="homepage-front-progress">
                <span style={{ width: `${progress}%` }}></span>
              </div>
            </div>

            <span className="homepage-front-arrow">&rarr;</span>

            <div className="homepage-front-card homepage-front-card--listing">
              <EditableMiniInput
                label="Listing heading"
                name="heroSection.listingPreview.heading"
                fallback="Your listing is ready!"
                className="homepage-front-card__title"
              />
              <div className="homepage-front-product">
                <button
                  type="button"
                  className="homepage-front-product__image"
                  data-bs-toggle="modal"
                  data-bs-target="#selectImageFileModal"
                  onClick={() => setSelectedFileFor("heroSection.listingPreview.productImage")}
                  title="Change product image"
                >
                  <img
                    src={productImage ? addUrlToFile(productImage) : "/images/select-photo.png"}
                    alt={getStringValue("heroSection.listingPreview.title") || "Product"}
                  />
                </button>
                {productImage ? (
                  <button
                    type="button"
                    className="homepage-front-clear homepage-front-clear--product"
                    aria-label="Clear product image"
                    onClick={() => setFieldValue("heroSection.listingPreview.productImage", "")}
                  >
                    <i className="fa fa-times"></i>
                  </button>
                ) : null}
              </div>
              <EditableMiniInput
                label="Listing title"
                name="heroSection.listingPreview.title"
                fallback="Nike Air Max 270 Men's Trainers"
                className="homepage-front-listing-title"
              />
              <div className="homepage-front-price-row">
                <span>$</span>
                <input
                  aria-label="Listing price"
                  className="homepage-inline-field homepage-inline-field--price"
                  name="heroSection.listingPreview.price"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="89"
                  value={getStringValue("heroSection.listingPreview.price")}
                />
              </div>
              <EditableMiniInput
                label="Condition"
                name="heroSection.listingPreview.condition"
                fallback="Very Good condition"
                className="homepage-front-condition"
              />
              <div className="homepage-front-feature-list">
                {listingFeatures.map((feature, index) => (
                  <div
                    className="homepage-front-feature-row"
                    key={`${listingFeaturesPath}-${index}`}
                  >
                    <span>
                      <i className="fa fa-check"></i>
                    </span>
                    <input
                      aria-label={`Listing feature ${index + 1}`}
                      className="homepage-inline-field"
                      name={`${listingFeaturesPath}.${index}`}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Listing feature"
                      value={getStringValue(`${listingFeaturesPath}.${index}`) || feature}
                    />
                    <button
                      type="button"
                      className="homepage-front-row-remove"
                      aria-label={`Remove feature ${index + 1}`}
                      onClick={() => removeArrayItem(listingFeaturesPath, index)}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="homepage-front-add homepage-front-add--wide"
                  onClick={() => addArrayItem(listingFeaturesPath, "")}
                >
                  + Feature
                </button>
              </div>
              <EditableMiniInput
                label="Button text"
                name="heroSection.listingPreview.button.text"
                fallback="Publish Listing"
                className="homepage-front-publish"
              />
              <input
                aria-label="Button URL"
                className="homepage-inline-field homepage-inline-field--url"
                name="heroSection.listingPreview.button.url"
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="Button URL"
                value={getStringValue("heroSection.listingPreview.button.url")}
              />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function EditableMiniInput({
  label,
  name,
  fallback,
  className,
}: {
  label: string;
  name: string;
  fallback: string;
  className: string;
}) {
  const { handleBlur, handleChange, getStringValue, getTouched, getError } =
    useHomepageForm();

  return (
    <div className="homepage-editable-text">
      <input
        aria-label={label}
        className={`homepage-inline-field ${className}`}
        name={name}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder={fallback}
        value={getStringValue(name)}
      />
      {getTouched(name) && getError(name) ? (
        <p className="custom-form-error text-danger mb-0">{getError(name)}</p>
      ) : null}
    </div>
  );
}

function TrustedByContentEditor() {
  const {
    handleBlur,
    handleChange,
    getArray,
    getStringValue,
    addArrayItem,
    removeArrayItem,
    setFieldValue,
    setSelectedFileFor,
  } = useHomepageForm();
  const path = "trustedBySection.logos";
  const items = getArray(path);

  return (
    <SectionCard title="Brand Logos Section">
      <div className="col-md-12">
        <div className="homepage-trusted-editor">
          <div className="homepage-trusted-head">
            <EditableContent
              className="homepage-trusted-title"
              label="Section title"
              name="trustedBySection.title"
              placeholder="Trusted Brands"
            />
            <span className="homepage-trusted-count">{items.length} Logos</span>
          </div>
          <div className="homepage-trusted-logos">
            {items.map((item, index) => {
              const logo = item as HomepageValues["trustedBySection"]["logos"][number];
              const imageName = `${path}.${index}.image`;
              const nameName = `${path}.${index}.name`;
              const urlName = `${path}.${index}.url`;
              const image = getStringValue(imageName) || logo.image;
              const name = getStringValue(nameName) || logo.name;

              return (
                <div className="homepage-trusted-logo-item" key={`${path}-${index}`}>
                  <button
                    type="button"
                    className="homepage-trusted-card-close"
                    aria-label={
                      image
                        ? `Clear ${name || `logo ${index + 1}`} image`
                        : `Remove ${name || `logo ${index + 1}`}`
                    }
                    onClick={() => {
                      if (image) {
                        setFieldValue(imageName, "");
                      } else {
                        removeArrayItem(path, index);
                      }
                    }}
                  >
                    <i className="fa fa-times"></i>
                  </button>
                  <button
                    type="button"
                    className="homepage-trusted-logo"
                    data-bs-toggle="modal"
                    data-bs-target="#selectImageFileModal"
                    onClick={() => setSelectedFileFor(imageName)}
                    title={`Change ${name || `logo ${index + 1}`}`}
                  >
                    {image ? (
                      <img src={addUrlToFile(image)} alt={name || `Logo ${index + 1}`} />
                    ) : (
                      <span className="homepage-trusted-logo-empty">
                        <i className="fa fa-image"></i>
                        Select logo
                      </span>
                    )}
                  </button>
                  <EditableContent
                    className="homepage-trusted-logo-name"
                    label={`Logo ${index + 1} name`}
                    name={nameName}
                    placeholder={
                      index === 0
                        ? "Havells"
                        : index === 1
                          ? "Crompton"
                          : index === 2
                            ? "Orient Electric"
                            : index === 3
                              ? "Luker"
                              : "Brand Name"
                    }
                    valueFallback={logo.name}
                  />
                  <label className="homepage-trusted-url-field">
                    <span>URL</span>
                    <input
                      aria-label={`Logo ${index + 1} URL`}
                      className="homepage-trusted-url"
                      name={urlName}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="https://..."
                      value={getStringValue(urlName) || logo.url}
                    />
                  </label>
                </div>
              );
            })}
            <button
              type="button"
              className="homepage-trusted-add"
              onClick={() => addArrayItem(path, createEmptyTrustedByLogo())}
            >
              + Add Logo
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function KeywordsTextarea({
  label,
  path,
  placeholder = "Enter keywords separated by commas",
}: {
  label: string;
  path: string;
  placeholder?: string;
}) {
  const { getArray, setFieldValue, getTouched, getError } = useHomepageForm();
  const keywords = getArray<string>(path);
  const keywordsString = keywords.filter((k) => k.trim()).join(", ");

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const keywordsList = value
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    setFieldValue(path, keywordsList);
  };

  return (
    <div className="col-md-12">
      <div className="form-group">
        <TextareaBox
          label={label}
          name={path}
          placeholder={placeholder}
          value={keywordsString}
          handleChange={handleChange}
          handleBlur={() => { }}
          touched={getTouched(path)}
          error={getError(path)}
        />
      </div>
    </div>
  );
}

function VideoContentEditor() {
  const { handleBlur, handleChange, getArray, getStringValue, addArrayItem, removeArrayItem } =
    useHomepageForm();
  const path = "videoSection.items";
  const items = getArray<HomepageValues["videoSection"]["items"][number]>(path);
  const nextFocusIndexRef = useRef<number | null>(null);

  function handleAddVideo() {
    nextFocusIndexRef.current = items.length;
    addArrayItem(path, createEmptyVideoItem());
  }

  useEffect(() => {
    if (nextFocusIndexRef.current === null) return;

    const index = nextFocusIndexRef.current;
    nextFocusIndexRef.current = null;

    window.setTimeout(() => {
      const card = document.getElementById(`homepage-video-card-${index}`);
      const input = document.getElementById(`homepage-video-title-${index}`) as HTMLInputElement | null;

      card?.scrollIntoView({ behavior: "smooth", block: "center" });
      input?.focus();
    }, 0);
  }, [items.length]);

  return (
    <SectionCard title="Video Section">
      <div className="col-md-12">
        <div className="homepage-video-editor">
          <div className="homepage-video-editor__top">
            <div>
              <span className="homepage-side-kicker">YouTube Videos</span>
              <h3>Event and highlight videos</h3>
            </div>
            <button
              type="button"
              className="homepage-video-add"
              onClick={handleAddVideo}
            >
              + Add Video
            </button>
          </div>

          <div className="homepage-video-list">
            {items.map((item, index) => (
              <article
                className="homepage-video-card"
                id={`homepage-video-card-${index}`}
                key={`${path}-${index}`}
              >
                <button
                  type="button"
                  className="homepage-video-remove"
                  aria-label={`Remove video ${index + 1}`}
                  onClick={() => removeArrayItem(path, index)}
                >
                  <i className="fa fa-times"></i>
                </button>

                <div className="homepage-video-number">{index + 1}</div>

                <div className="homepage-video-fields">
                  <input
                    aria-label={`Video ${index + 1} title`}
                    className="form-control"
                    id={`homepage-video-title-${index}`}
                    name={`${path}.${index}.title`}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Video title"
                    value={getStringValue(`${path}.${index}.title`) || item.title}
                  />
                  <textarea
                    aria-label={`Video ${index + 1} description`}
                    className="form-control"
                    name={`${path}.${index}.description`}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Short description"
                    value={getStringValue(`${path}.${index}.description`) || item.description}
                  />
                  <input
                    aria-label={`Video ${index + 1} YouTube URL`}
                    className="form-control"
                    name={`${path}.${index}.url`}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="YouTube URL"
                    value={getStringValue(`${path}.${index}.url`) || item.url}
                  />
                </div>
              </article>
            ))}

            {items.length === 0 ? (
              <div className="homepage-video-empty">
                <p className="mb-0">No videos added yet.</p>
                <button
                  type="button"
                  className="homepage-video-add"
                  onClick={handleAddVideo}
                >
                  + Add Video
                </button>
              </div>
            ) : null}
          </div>
          {items.length ? (
            <div className="homepage-video-footer">
              <span>{items.length} videos added</span>
              <button
                type="button"
                className="homepage-video-add"
                onClick={handleAddVideo}
              >
                + Add Another Video
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function getYouTubeVideoId(url: string): string {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/").filter(Boolean)[1] || "";
      }

      const videoId = parsedUrl.searchParams.get("v");
      if (videoId) return videoId;
    }

    if (parsedUrl.hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.replace("/", "");
      if (videoId) return videoId;
    }
  } catch {
    return "";
  }

  return "";
}

function getYouTubeThumbnailUrl(url: string): string {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
}

function getUrlPreviewType(url: string): "youtube" | "image" | "video" | "link" | "" {
  if (!url) return "";
  if (getYouTubeEmbedUrl(url)) return "youtube";

  const cleanUrl = url.split("?")[0].toLowerCase();
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/.test(cleanUrl)) return "image";
  if (/\.(mp4|webm|ogg|mov)$/.test(cleanUrl)) return "video";

  try {
    new URL(url);
    return "link";
  } catch {
    return "";
  }
}

function OnAirContentEditor() {
  const { handleBlur, handleChange, getArray, getStringValue, addArrayItem, removeArrayItem } =
    useHomepageForm();
  const path = "onAirSection.urls";
  const urls = getArray<string>(path);
  const nextFocusIndexRef = useRef<number | null>(null);
  const [editingUrlIndex, setEditingUrlIndex] = useState<number | null>(null);

  function handleAddUrl() {
    nextFocusIndexRef.current = urls.length;
    setEditingUrlIndex(urls.length);
    addArrayItem(path, "");
  }

  function handleRemoveUrl(index: number) {
    removeArrayItem(path, index);
    setEditingUrlIndex((current) => {
      if (current === null) return null;
      const nextLength = Math.max(urls.length - 1, 0);
      if (nextLength === 0 || current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  }

  function handleEditUrl(index: number) {
    setEditingUrlIndex(index);
    window.setTimeout(() => {
      const input = document.getElementById(`homepage-on-air-url-${index}`) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    }, 0);
  }

  useEffect(() => {
    if (nextFocusIndexRef.current === null) return;

    const index = nextFocusIndexRef.current;
    nextFocusIndexRef.current = null;

    window.setTimeout(() => {
      const input = document.getElementById(`homepage-on-air-url-${index}`) as HTMLInputElement | null;
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
      input?.focus();
    }, 0);
  }, [urls.length]);

  return (
    <SectionCard title="On Air Section">
      <div className="col-md-12">
        <div className="homepage-on-air-editor">
          <div className="homepage-on-air-top">
            <div>
              <span className="homepage-side-kicker">Carousel Links</span>
              <input
                aria-label="On Air section title"
                className="form-control homepage-on-air-title"
                name="onAirSection.title"
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="IFMA On Air"
                value={getStringValue("onAirSection.title")}
              />
            </div>
            <span className="homepage-on-air-count">{urls.length} URLs</span>
          </div>

          <div className="homepage-on-air-grid">
            {urls.map((url, index) => {
              const value = getStringValue(`${path}.${index}`) || url;
              const previewType = getUrlPreviewType(value);
              const youtubeThumbnailUrl = getYouTubeThumbnailUrl(value);
              const isEditing = editingUrlIndex === index || !value;

              return (
                <article className="homepage-on-air-card" key={`${path}-${index}`}>
                  <div className="homepage-on-air-card-actions">
                    <button
                      type="button"
                      className="homepage-on-air-card-button"
                      aria-label={`Change URL ${index + 1}`}
                      onClick={() => handleEditUrl(index)}
                    >
                      <i className="fa fa-pencil"></i>
                    </button>
                    <button
                      type="button"
                      className="homepage-on-air-card-button is-danger"
                      aria-label={`Remove URL ${index + 1}`}
                      onClick={() => handleRemoveUrl(index)}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>

                  <div className="homepage-on-air-preview">
                    {previewType === "youtube" ? (
                      <a
                        className="homepage-on-air-youtube-thumb"
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open YouTube preview ${index + 1}`}
                      >
                        <img src={youtubeThumbnailUrl} alt={`On Air preview ${index + 1}`} />
                        <span>
                          <i className="fa fa-play"></i>
                        </span>
                      </a>
                    ) : previewType === "image" ? (
                      <img src={value} alt={`On Air preview ${index + 1}`} />
                    ) : previewType === "video" ? (
                      <video controls>
                        <source src={value} />
                      </video>
                    ) : previewType === "link" ? (
                      <a href={value} target="_blank" rel="noreferrer">
                        Open URL
                      </a>
                    ) : (
                      <div className="homepage-on-air-preview-empty">
                        <i className="fa fa-play-circle"></i>
                        <span>Add URL</span>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="homepage-on-air-url-edit">
                      <input
                        aria-label={`On Air URL ${index + 1}`}
                        className="form-control"
                        id={`homepage-on-air-url-${index}`}
                        name={`${path}.${index}`}
                        onBlur={(event) => {
                          handleBlur(event);
                          if (event.currentTarget.value.trim()) {
                            setEditingUrlIndex(null);
                          }
                        }}
                        onChange={handleChange}
                        placeholder="Paste YouTube/video/image URL"
                        value={value}
                      />
                    </div>
                  ) : null}
                </article>
              );
            })}

            <button type="button" className="homepage-on-air-add-card" onClick={handleAddUrl}>
              <i className="fa fa-plus"></i>
              <span>Add URL</span>
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function StoryVideoEditor() {
  const {
    handleBlur,
    handleChange,
    getStringValue,
    setFieldValue,
    setSelectedFileFor,
  } = useHomepageForm();
  const thumbnailPath = "storyVideoSection.thumbnail";
  const thumbnail = getStringValue(thumbnailPath);
  const url = getStringValue("storyVideoSection.url");
  const youtubeThumbnailUrl = getYouTubeThumbnailUrl(url);
  const previewImage = thumbnail ? addUrlToFile(thumbnail) : youtubeThumbnailUrl;

  return (
    <SectionCard title="Story Video Section">
      <div className="col-md-12">
        <div className="homepage-story-video-editor">
          <button
            type="button"
            className="homepage-story-video-thumb"
            data-bs-toggle="modal"
            data-bs-target="#selectImageFileModal"
            onClick={() => setSelectedFileFor(thumbnailPath)}
          >
            {previewImage ? (
              <img src={previewImage} alt="Story video thumbnail" />
            ) : (
              <div>
                <i className="fa fa-image"></i>
                <span>Select thumbnail</span>
              </div>
            )}
            <span className="homepage-story-video-play">
              <i className="fa fa-play"></i>
            </span>
          </button>

          <div className="homepage-story-video-fields">
            <span className="homepage-side-kicker">Thumbnail + YouTube Link</span>
            <input
              aria-label="Story video URL"
              className="form-control"
              name="storyVideoSection.url"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Paste YouTube video URL"
              value={url}
            />
            <div className="homepage-story-video-actions">
              <button
                type="button"
                className="homepage-story-video-select"
                data-bs-toggle="modal"
                data-bs-target="#selectImageFileModal"
                onClick={() => setSelectedFileFor(thumbnailPath)}
              >
                Change Thumbnail
              </button>
              {thumbnail ? (
                <button
                  type="button"
                  className="homepage-story-video-clear"
                  onClick={() => setFieldValue(thumbnailPath, "")}
                >
                  Clear Thumbnail
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function ChairmanMessageEditor() {
  const {
    handleBlur,
    handleChange,
    getStringValue,
    setFieldValue,
    setSelectedFileFor,
  } = useHomepageForm();
  const imagePath = "chairmanMessageSection.image";
  const image = getStringValue(imagePath);

  return (
    <SectionCard title="Chairman Message Section">
      <div className="col-md-12">
        <div className="homepage-chairman-editor">
          <div className="homepage-chairman-fields">
            <input
              aria-label="Message heading"
              className="form-control homepage-chairman-heading"
              name="chairmanMessageSection.heading"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Message from Chairman"
              value={getStringValue("chairmanMessageSection.heading")}
            />
            <input
              aria-label="Chairman name"
              className="form-control"
              name="chairmanMessageSection.name"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Name"
              value={getStringValue("chairmanMessageSection.name")}
            />
            <textarea
              aria-label="Chairman designation"
              className="form-control homepage-chairman-designation"
              name="chairmanMessageSection.designation"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Designation"
              value={getStringValue("chairmanMessageSection.designation")}
            />
            <textarea
              aria-label="Chairman message"
              className="form-control homepage-chairman-message"
              name="chairmanMessageSection.message"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Message"
              value={getStringValue("chairmanMessageSection.message")}
            />
            <div className="homepage-chairman-button-row">
              <input
                aria-label="Button text"
                className="form-control"
                name="chairmanMessageSection.button.text"
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="Button text"
                value={getStringValue("chairmanMessageSection.button.text")}
              />
              <input
                aria-label="Button URL"
                className="form-control"
                name="chairmanMessageSection.button.url"
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="Button URL"
                value={getStringValue("chairmanMessageSection.button.url")}
              />
            </div>
          </div>

          <div className="homepage-chairman-image-wrap">
            <button
              type="button"
              className="homepage-chairman-image"
              data-bs-toggle="modal"
              data-bs-target="#selectImageFileModal"
              onClick={() => setSelectedFileFor(imagePath)}
            >
              {image ? (
                <img src={addUrlToFile(image)} alt="Chairman" />
              ) : (
                <span>
                  <i className="fa fa-image"></i>
                  Select image
                </span>
              )}
            </button>
            {image ? (
              <button
                type="button"
                className="homepage-chairman-image-remove"
                aria-label="Clear chairman image"
                onClick={() => setFieldValue(imagePath, "")}
              >
                <i className="fa fa-times"></i>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export function HomepageContent() {
  const [updating, setUpdating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [mediaLoading, setMediaLoading] = useState<boolean>(false);
  const [selectedFileFor, setSelectedFileFor] = useState<string>("");
  const selectedFileForRef = useRef<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
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
    onSubmit: async function (
      values: HomepageValues,
      helpers: FormikHelpers<HomepageValues>,
    ) {
      setUpdating(true);

      const homepageSections = normalizeHomepageValues(values);
      const payload = stripMongoFields(homepageSections);
      const apiResponse = await post("/homepage", payload, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }

      setUpdating(false);
    },
    initialValues: homepageInitialValues,
    validationSchema: homepageSchema,
  });

  useEffect(function () {
    async function getData() {
      setLoading(true);

      const apiResponse = await get("/homepage", true);

      if (apiResponse?.status == 200) {
        const cleanData = stripMongoFields(apiResponse.body);
        setValues(
          normalizeHomepageValues(mergeHomepageValues(homepageInitialValues, cleanData)),
        );
      }

      setLoading(false);
    }

    getData();
  }, [setValues]);

  function setActiveFileField(field: string) {
    selectedFileForRef.current = field;
    setSelectedFileFor(field);
  }

  async function uploadMediaFiles(
    files: FileList | null,
    selectedField?: string,
  ): Promise<MediaRecord[]> {
    const mimeTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

    if (!files || files.length === 0) {
      toast.error("Please select at least one file.");
      return [];
    }

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!mimeTypes.includes(file.type)) {
        toast.error("Please select only jpeg, png, webp or svg images.");
      } else {
        formData.append("files", file);
      }
    }

    if (!formData.has("files")) return [];

    try {
      const url = `${API_URL}/media`;
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        setRecords((old) => [...apiData.body, ...old]);
        const targetField = selectedField || selectedFileForRef.current;
        if (targetField && apiData.body?.[0]?.filename) {
          void setFieldValue(targetField, apiData.body[0].filename);
          toast.success("Image selected");
        }
        return apiData.body || [];
      } else {
        toast.error(apiData?.message);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to upload file");
    }

    return [];
  }

  async function handleUploadFile(event: ChangeEvent<HTMLInputElement>) {
    const uploadedMedia = await uploadMediaFiles(
      event.target.files,
      selectedFileForRef.current || selectedFileFor,
    );
    if (uploadedMedia.length > 0) {
      event.target.value = "";
    }
  }

  useEffect(
    function () {
      async function getMedia() {
        setMediaLoading(true);

        let url = `/media?page=${pagination.page}&limit=${pagination.limit}&fileType=IMAGE`;
        if (searchQuery) url += `&searchQuery=${encodeURIComponent(searchQuery)}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
          setPagination((current) => ({
            ...current,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          }));
        } else {
          setRecords([]);
          toast.error(apiResponse?.message);
        }

        setMediaLoading(false);
      }

      getMedia();
    },
    [pagination.page, pagination.limit, searchQuery],
  );

  function handleSelectImage(img: MediaRecord) {
    const targetField = selectedFileForRef.current || selectedFileFor;
    if (!targetField) {
      toast.error("Please choose where to use this image first.");
      return;
    }
    void setFieldValue(targetField, img.filename);
    toast.success("Image selected");
  }

  function getFieldValue(name: string): unknown {
    return getIn(values, name);
  }

  function getStringValue(name: string): string {
    const value = getFieldValue(name);
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return value;
    return "";
  }

  function getNumberValue(name: string): number {
    const value = getFieldValue(name);
    if (typeof value === "number") return value;
    if (typeof value === "string" && value !== "") return Number(value);
    return 0;
  }

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function getArray<T>(path: string): T[] {
    const value = getFieldValue(path);
    return Array.isArray(value) ? (value as T[]) : [];
  }

  function addArrayItem<T>(path: string, item: T) {
    void setFieldValue(path, [...getArray<T>(path), item]);
  }

  function removeArrayItem(path: string, index: number) {
    const updated = getArray<unknown>(path).filter((_, itemIndex) => itemIndex !== index);
    void setFieldValue(path, updated);
  }

  function moveArrayItem(path: string, fromIndex: number, toIndex: number) {
    const items = getArray<unknown>(path);

    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= items.length ||
      toIndex >= items.length
    ) {
      return;
    }

    const updated = [...items];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    void setFieldValue(path, updated);
  }

  const homepageFormContext: HomepageFormContextValue = {
    handleBlur: handleBlur as HomepageFormContextValue["handleBlur"],
    handleChange: handleChange as HomepageFormContextValue["handleChange"],
    setFieldValue: (field, value) => {
      void setFieldValue(field, value);
    },
    setSelectedFileFor: setActiveFileField,
    getFieldValue,
    getStringValue,
    getNumberValue,
    getError,
    getTouched,
    getArray,
    addArrayItem,
    removeArrayItem,
    moveArrayItem,
  };

  return (
    <HomepageFormContext.Provider value={homepageFormContext}>
      <div className="content-wrapper homepage-admin-page">
        <div className="homepage-page-header">
          <div>
            <div className="homepage-page-header__actions">
              <GoBackButton />
              <span className="homepage-page-eyebrow">Pages</span>
            </div>
            <h1>Home Page</h1>
            <p>Manage homepage media, videos, chairman message, and SEO.</p>
          </div>
          <div className="homepage-page-header__meta">
            <span className="homepage-page-pill">Live content</span>
            <span className="homepage-page-note">Media library connected</span>
          </div>
        </div>

        {loading ? <OverlayLoading /> : null}

        <form className="forms-sample homepage-form" onSubmit={handleSubmit}>
          <div className="homepage-form-layout">
            <main className="homepage-form-main">
              <TrustedByContentEditor />

              <VideoContentEditor />

              <OnAirContentEditor />

              <ChairmanMessageEditor />
              <StoryVideoEditor />

              <SectionCard title="SEO">
                <FieldInput label="Meta Title" name="seo.metaTitle" col="col-md-6" />
                <TextAreaInput
                  label="Meta Description"
                  name="seo.metaDescription"
                  col="col-md-12"
                />
                <KeywordsTextarea label="Meta Keywords" path="seo.keywords" />
              </SectionCard>

              <div className="homepage-sticky-actions">
                <div>
                  <strong>Home Page</strong>
                  <span>Save all homepage sections and SEO content.</span>
                </div>
                <SubmitButton loading={updating} text="Update Details" />
              </div>
            </main>

            <aside className="homepage-form-side">
              <div className="card homepage-summary-card">
                <div className="card-body">
                  <span className="homepage-side-kicker">Overview</span>
                  <h2>Page sections</h2>
                  <ul className="homepage-check-list">
                    <li><i className="fa fa-check"></i>Trusted by logos</li>
                    <li><i className="fa fa-check"></i>YouTube videos</li>
                    <li><i className="fa fa-check"></i>On Air links</li>
                    <li><i className="fa fa-check"></i>Story video</li>
                    <li><i className="fa fa-check"></i>Chairman message</li>
                    <li><i className="fa fa-check"></i>SEO metadata</li>
                  </ul>
                </div>
              </div>

              <div className="card homepage-summary-card">
                <div className="card-body">
                  <span className="homepage-side-kicker">Quick tips</span>
                  <div className="homepage-tip-list">
                    <p>Use consistent short headings so cards scan well on mobile.</p>
                    <p>Keep logo and thumbnail images clean, sharp, and consistently sized.</p>
                    <p>Update SEO title and keywords whenever homepage content changes.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>

      <div
        className="modal fade"
        id="selectImageFileModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectImageFileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl homepage-media-modal">
          <div className="modal-content">
            <div className="modal-header homepage-media-modal__header">
              <div>
                <span className="homepage-side-kicker">Media library</span>
                <h1 className="modal-title" id="selectImageFileModalLabel">
                  Select Image
                </h1>
              </div>

              <div className="homepage-media-modal__tools">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleUploadFile}
                  multiple
                />

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search media"
                  value={searchQuery}
                  onChange={(event) => {
                    setPagination((current) => ({ ...current, page: 1 }));
                    setSearchQuery(event.target.value);
                  }}
                />
              </div>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {mediaLoading ? <p className="homepage-media-state">Loading media...</p> : null}
              <div className="homepage-media-grid media-list-section">
                {records?.map((item, index) => (
                  <div className="homepage-media-grid__item" key={item._id || item.filename || index}>
                    <div className="card homepage-media-tile">
                      <button
                        type="button"
                        className="homepage-media-select-btn"
                        data-bs-dismiss="modal"
                        aria-label={`Select ${item.filename}`}
                        onClick={() => handleSelectImage(item)}
                      >
                        <img src={addUrlToFile(item.filename)} alt="" />
                      </button>
                    </div>
                  </div>
                ))}
                {!mediaLoading && records.length === 0 ? (
                  <div className="homepage-media-state">
                    <p className="mb-0">No media found.</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive px-3">
                  <Pagination
                    pagination={pagination}
                    setPagination={setPagination}
                    tableName="table-to-xls"
                    csvFileName="images"
                  />
                </div>
              </div>
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
    </HomepageFormContext.Provider>
  );
}
