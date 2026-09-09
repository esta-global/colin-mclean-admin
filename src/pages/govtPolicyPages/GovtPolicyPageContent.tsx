import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
  GovtPolicyPageValues,
  createGovtEngagementDefaultValues,
  createGovtPolicyPageInitialValues,
  govtPolicyPageSchema,
  govtPolicyPages,
  BisBeeContent,
  BisBeeSection,
  BisBeeTable,
} from "../../validationSchemas/govtPolicyPageSchema";

type ApiBody = Partial<GovtPolicyPageValues> & {
  _id?: string;
  __v?: number;
  slug?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MediaRecord = { _id?: string; filename: string };

class MediaUploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  async upload() {
    const file = await this.loader.file;
    const formData = new FormData();
    formData.append("files", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/media`, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
    const apiData = await response.json();

    if (apiData?.status !== 200 || !apiData?.body?.[0]?.filename) {
      throw new Error(apiData?.message || "Unable to upload image");
    }

    return {
      default: addUrlToFile(apiData.body[0].filename),
    };
  }

  abort() {}
}

function mediaUploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) =>
    new MediaUploadAdapter(loader);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeValues<T>(initial: T, incoming: unknown): T {
  if (Array.isArray(initial))
    return (Array.isArray(incoming) ? incoming : initial) as T;
  if (isPlainObject(initial)) {
    const source = isPlainObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};
    Object.keys(initial).forEach((key) => {
      result[key] = mergeValues(initial[key], source[key]);
    });
    return result as T;
  }
  return (
    incoming === undefined || incoming === null ? initial : incoming
  ) as T;
}

function stripApiFields(data: ApiBody): Partial<GovtPolicyPageValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.slug;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function atmanirbharSectionsToHtml(
  sections: GovtPolicyPageValues["atmanirbharSections"] = [],
) {
  return sections
    .map((section) => {
      const paragraphs = section.paragraphs
        .map((paragraph) =>
          paragraph.style === "highlighted"
            ? `<blockquote>${paragraph.text}</blockquote>`
            : `<p>${paragraph.text}</p>`,
        )
        .join("\n");
      const stats = section.stats.length
        ? `<ul>${section.stats.map((stat) => `<li><strong>${stat.value}</strong> - ${stat.label}</li>`).join("")}</ul>`
        : "";
      const cards = section.cards.length
        ? `<ol>${section.cards.map((card) => `<li><strong>${card.title}:</strong> ${card.description}</li>`).join("")}</ol>`
        : "";
      return `<section id="${section.id}"><p class="eyebrow">${section.eyebrow}</p><h2>${section.title} <span>${section.highlightedTitle}</span></h2>${paragraphs}${stats}${cards}</section>`;
    })
    .join("\n");
}

function normalizeValues(values: GovtPolicyPageValues): GovtPolicyPageValues {
  if (!values) return values;
  const ds = values.detailsSection || {
    heading: "",
    paragraphs: [],
    introParagraphs: [],
    bulletHeading: "",
    bullets: [],
    bottomParagraphs: [],
    cta: { label: "", url: "" },
  };
  const seo = values.seo || {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  };
  const richContent = values.richContent || { html: "" };
  const sections = (values.sections || []).map((section) => {
    const normalizedSection = { ...section };
    if (
      section.id === "gst" &&
      !section.pillarsHeading &&
      section.description.includes("IFMA's request rests on 5 key pillars:")
    ) {
      const [description, pillarsHeading] = section.description.split(
        "\n\nIFMA's request rests on 5 key pillars:",
      );
      normalizedSection.description = description.trim();
      normalizedSection.pillarsHeading =
        "IFMA's request rests on 5 key pillars:";
    }
    if (section.id === "imports") {
      const callout =
        section.highlightedCallout?.trim() ||
        "Any barriers to trade or restriction on any category for imports by the way of a ban or imposition of prohibitory tariffs/duties may be detrimental to both demand and supply.";
      let paragraphs = (section.paragraphs || [])
        .map((paragraph) => ({
          text: (paragraph.text || "").trim(),
          style:
            paragraph.style === "highlighted"
              ? ("highlighted" as const)
              : ("normal" as const),
        }))
        .filter((paragraph) => paragraph.text);

      if (!paragraphs.length) {
        paragraphs = (section.description || "")
          .split(/\n\s*\n/)
          .map((text) => ({ text: text.trim(), style: "normal" as const }))
          .filter((paragraph) => paragraph.text);
        const calloutIndex = paragraphs.findIndex(
          (paragraph) => paragraph.text === callout,
        );
        if (calloutIndex >= 0) {
          paragraphs[calloutIndex] = { text: callout, style: "highlighted" };
        } else if (callout) {
          paragraphs.splice(Math.min(2, paragraphs.length), 0, {
            text: callout,
            style: "highlighted",
          });
        }
      }

      normalizedSection.paragraphs = paragraphs;
      normalizedSection.description = paragraphs
        .filter((paragraph) => paragraph.style === "normal")
        .map((paragraph) => paragraph.text)
        .join("\n\n");
      normalizedSection.highlightedCallout =
        paragraphs.find((paragraph) => paragraph.style === "highlighted")
          ?.text || "";
    }

    return {
      ...normalizedSection,
      buttons: (section.buttons || []).map((button) => {
        if (button.note || !button.title.includes("(Page 5,")) return button;
        const [title, note] = button.title.split(" (Page 5,");
        return {
          ...button,
          title: title.trim(),
          note: `(Page 5,${note}`.trim(),
        };
      }),
    };
  });

  return {
    ...values,
    sections,
    atmanirbharSections: (values.atmanirbharSections || []).map((section) => {
      const paragraphs = (
        section.paragraphs as unknown as Array<string | GovtEngagementParagraph>
      )
        .map((paragraph) =>
          typeof paragraph === "string"
            ? { text: paragraph.trim(), style: "normal" as const }
            : {
                text: (paragraph.text || "").trim(),
                style:
                  paragraph.style === "highlighted"
                    ? ("highlighted" as const)
                    : ("normal" as const),
              },
        )
        .filter((paragraph) => paragraph.text);
      if (
        section.highlightedParagraph?.trim() &&
        !paragraphs.some((paragraph) => paragraph.style === "highlighted")
      ) {
        paragraphs.push({
          text: section.highlightedParagraph.trim(),
          style: "highlighted",
        });
      }
      return { ...section, paragraphs };
    }),
    detailsSection: {
      heading: ds.heading || "",
      paragraphs: (ds.paragraphs || [])
        .map((item) => (item || "").trim())
        .filter(Boolean),
      introParagraphs: (ds.introParagraphs || [])
        .map((item) => (item || "").trim())
        .filter(Boolean),
      bulletHeading: (ds.bulletHeading || "").trim(),
      bullets: (ds.bullets || [])
        .map((item) => (item || "").trim())
        .filter(Boolean),
      bottomParagraphs: (ds.bottomParagraphs || [])
        .map((item) => ({
          text: (item?.text || "").trim(),
          isItalic: Boolean(item?.isItalic),
        }))
        .filter((item) => item.text),
      cta: {
        label: (ds.cta?.label || "").trim(),
        url: (ds.cta?.url || "").trim(),
      },
    },
    richContent: {
      html: values.atmanirbharSections?.length
        ? atmanirbharSectionsToHtml(values.atmanirbharSections)
        : richContent.html || "",
    },
    seo: {
      metaTitle: seo.metaTitle || "",
      metaDescription: seo.metaDescription || "",
      keywords: (seo.keywords || [])
        .map((k) => (k || "").trim())
        .filter(Boolean),
    },
  };
}

function mergeGovtPageValues(
  initialValues: GovtPolicyPageValues,
  incomingValues: unknown,
  slug: string,
): GovtPolicyPageValues {
  const mergedValues = mergeValues(initialValues, incomingValues);
  return mergedValues;
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="about-page-section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

function AtmanirbharSectionsEditor({
  values,
  setFieldValue,
}: {
  values: GovtPolicyPageValues;
  setFieldValue: (field: string, value: unknown) => void;
}) {
  const sections = values.atmanirbharSections || [];
  const update = (field: string, value: unknown) =>
    setFieldValue(
      field ? `atmanirbharSections.${field}` : "atmanirbharSections",
      value,
    );

  return (
    <section className="card about-page-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <SectionHeading eyebrow="Atmanirbhar" title="Content Sections" />
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              update("", [
                ...sections,
                {
                  id: `section-${Date.now()}`,
                  eyebrow: "",
                  title: "",
                  highlightedTitle: "",
                  paragraphs: [],
                  highlightedParagraph: "",
                  stats: [],
                  cards: [],
                },
              ])
            }
            type="button"
          >
            + Add Section
          </button>
        </div>
        {sections.map((section, sectionIndex) => (
          <div
            className="border rounded p-3 mb-4 bg-light"
            key={`${section.id}-${sectionIndex}`}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <strong className="text-primary fs-5">
                Section #{sectionIndex + 1}: {section.id || "Untitled"}
              </strong>
              <button
                className="btn btn-sm btn-danger"
                onClick={() =>
                  update(
                    "",
                    sections.filter((_, index) => index !== sectionIndex),
                  )
                }
                type="button"
              >
                <i className="fa fa-trash"></i> Remove Section
              </button>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label">Section ID</label>
                <input
                  className="form-control"
                  value={section.id}
                  onChange={(event) =>
                    update(`${sectionIndex}.id`, event.target.value)
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Eyebrow</label>
                <input
                  className="form-control"
                  value={section.eyebrow}
                  onChange={(event) =>
                    update(`${sectionIndex}.eyebrow`, event.target.value)
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Main Heading</label>
                <input
                  className="form-control"
                  value={section.title}
                  onChange={(event) =>
                    update(`${sectionIndex}.title`, event.target.value)
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Highlighted Heading</label>
                <input
                  className="form-control"
                  value={section.highlightedTitle}
                  onChange={(event) =>
                    update(
                      `${sectionIndex}.highlightedTitle`,
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Paragraphs</strong>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    update(`${sectionIndex}.paragraphs`, [
                      ...section.paragraphs,
                      { text: "", style: "normal" },
                    ])
                  }
                  type="button"
                >
                  + Add Paragraph
                </button>
              </div>
              {section.paragraphs.map((paragraph, index) => (
                <div className="row g-2 mb-2" key={index}>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={paragraph.style}
                      onChange={(event) =>
                        update(
                          `${sectionIndex}.paragraphs.${index}.style`,
                          event.target.value,
                        )
                      }
                    >
                      <option value="normal">Normal</option>
                      <option value="highlighted">Highlighted</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <textarea
                      className="form-control"
                      rows={2}
                      value={paragraph.text}
                      onChange={(event) =>
                        update(
                          `${sectionIndex}.paragraphs.${index}.text`,
                          event.target.value,
                        )
                      }
                      placeholder="Paragraph text"
                    />
                  </div>
                  <div className="col-md-1">
                    <button
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={() =>
                        update(
                          `${sectionIndex}.paragraphs`,
                          section.paragraphs.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      type="button"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-3 border rounded p-2 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Stats</strong>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    update(`${sectionIndex}.stats`, [
                      ...section.stats,
                      { value: "", label: "" },
                    ])
                  }
                  type="button"
                >
                  + Add Stat
                </button>
              </div>
              {section.stats.map((stat, index) => (
                <div className="row g-2 mb-2" key={index}>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Value"
                      value={stat.value}
                      onChange={(event) =>
                        update(
                          `${sectionIndex}.stats.${index}.value`,
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="col-md-7">
                    <input
                      className="form-control"
                      placeholder="Label"
                      value={stat.label}
                      onChange={(event) =>
                        update(
                          `${sectionIndex}.stats.${index}.label`,
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="col-md-1">
                    <button
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={() =>
                        update(
                          `${sectionIndex}.stats`,
                          section.stats.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      type="button"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border rounded p-2 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Cards / Pillars</strong>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    update(`${sectionIndex}.cards`, [
                      ...section.cards,
                      { title: "", description: "" },
                    ])
                  }
                  type="button"
                >
                  + Add Card
                </button>
              </div>
              {section.cards.map((card, index) => (
                <div className="row g-2 mb-2" key={index}>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Card title"
                      value={card.title}
                      onChange={(event) =>
                        update(
                          `${sectionIndex}.cards.${index}.title`,
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="col-md-7">
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Card description"
                      value={card.description}
                      onChange={(event) =>
                        update(
                          `${sectionIndex}.cards.${index}.description`,
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="col-md-1">
                    <button
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={() =>
                        update(
                          `${sectionIndex}.cards`,
                          section.cards.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      type="button"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!sections.length ? (
          <div className="text-muted">
            No sections yet. Add a section to begin.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BisBeeTableEditor({
  table,
  onChange,
  onRemove,
}: {
  table: BisBeeTable;
  onChange: (table: BisBeeTable) => void;
  onRemove: () => void;
}) {
  const addColumn = () =>
    onChange({
      ...table,
      headers: [...table.headers, ""],
      rows: table.rows.map((row) => [...row, ""]),
    });
  const removeColumn = (columnIndex: number) =>
    onChange({
      ...table,
      headers: table.headers.filter((_, index) => index !== columnIndex),
      rows: table.rows.map((row) =>
        row.filter((_, index) => index !== columnIndex),
      ),
    });
  const addRow = () =>
    onChange({
      ...table,
      rows: [...table.rows, new Array(table.headers.length || 1).fill("")],
    });
  const removeRow = (rowIndex: number) =>
    onChange({
      ...table,
      rows: table.rows.filter((_, index) => index !== rowIndex),
    });

  return (
    <div className="border rounded p-3 mb-3">
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            value={table.type}
            onChange={(event) =>
              onChange({ ...table, type: event.target.value })
            }
          >
            <option value="specification">Specification</option>
            <option value="rating">Rating</option>
            <option value="performance">Performance</option>
          </select>
        </div>
        <div className="col-md-5">
          <label className="form-label">Table Title</label>
          <input
            className="form-control"
            value={table.title}
            onChange={(event) =>
              onChange({ ...table, title: event.target.value })
            }
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Subtitle / validity</label>
          <input
            className="form-control"
            value={table.subtitle || ""}
            onChange={(event) =>
              onChange({ ...table, subtitle: event.target.value })
            }
            placeholder="Valid from..."
          />
        </div>
        <div className="col-md-12">
          <label className="form-label">Footer / table references</label>
          <input
            className="form-control"
            value={table.footerText || ""}
            onChange={(event) =>
              onChange({ ...table, footerText: event.target.value })
            }
            placeholder="(Table 3.1) (Table 3.2)"
          />
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>Table Columns</strong>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={addColumn}
            type="button"
          >
            + Add Column
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={addRow}
            type="button"
          >
            + Add Row
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered align-middle mb-2">
          <thead>
            <tr>
              {table.headers.map((header, columnIndex) => (
                <th key={columnIndex} style={{ minWidth: 180 }}>
                  <div className="d-flex gap-1">
                    <input
                      className="form-control form-control-sm"
                      placeholder={`Header ${columnIndex + 1}`}
                      value={header}
                      onChange={(event) => {
                        const headers = [...table.headers];
                        headers[columnIndex] = event.target.value;
                        onChange({ ...table, headers });
                      }}
                    />
                    {table.headers.length > 1 ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeColumn(columnIndex)}
                        type="button"
                      >
                        x
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
              {table.headers.length === 0 ? (
                <th>No columns yet. Add a column to start.</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {table.headers.map((_, columnIndex) => (
                  <td key={columnIndex}>
                    <input
                      className="form-control form-control-sm"
                      placeholder={`Row ${rowIndex + 1}, cell ${columnIndex + 1}`}
                      value={row[columnIndex] || ""}
                      onChange={(event) => {
                        const rows = table.rows.map((currentRow, index) =>
                          index === rowIndex ? [...currentRow] : currentRow,
                        );
                        rows[rowIndex][columnIndex] = event.target.value;
                        onChange({ ...table, rows });
                      }}
                    />
                  </td>
                ))}
                <td style={{ width: 70 }}>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeRow(rowIndex)}
                    type="button"
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
            {table.rows.length === 0 ? (
              <tr>
                <td
                  className="text-muted"
                  colSpan={Math.max(table.headers.length + 1, 2)}
                >
                  No rows yet. Add a row to start.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <button
        className="btn btn-link text-danger px-0"
        onClick={onRemove}
        type="button"
      >
        Remove Table
      </button>
    </div>
  );
}

function BisBeeEditor({
  values,
  setFieldValue,
}: {
  values: GovtPolicyPageValues;
  setFieldValue: (field: string, value: unknown) => void;
}) {
  const content: BisBeeContent = values.bisBeeContent || {
    introHeadingPrimary: "",
    introHeadingHighlight: "",
    introParagraphs: [],
    sections: [],
  };
  const update = (field: string, value: unknown) =>
    setFieldValue(`bisBeeContent.${field}`, value);

  const updateSection = (index: number, section: BisBeeSection) =>
    update(`sections.${index}`, section);
  const updateTable = (
    sectionIndex: number,
    tableIndex: number,
    table: BisBeeTable,
  ) => update(`sections.${sectionIndex}.tables.${tableIndex}`, table);

  return (
    <>
      <section className="card about-page-card">
        <div className="card-body">
          <SectionHeading eyebrow="Pages" title="BIS & BEE Introduction" />
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Primary title (navy)</label>
              <input
                className="form-control"
                value={content.introHeadingPrimary}
                onChange={(event) =>
                  update("introHeadingPrimary", event.target.value)
                }
                placeholder="BIS STANDARDS AND"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Highlighted title (gold)</label>
              <input
                className="form-control"
                value={content.introHeadingHighlight}
                onChange={(event) =>
                  update("introHeadingHighlight", event.target.value)
                }
                placeholder="BEE STAR LABELLING"
              />
            </div>
          </div>
          <div className="industry-editor-list">
            <div className="industry-editor-list__head">
              <strong>Introduction Paragraphs</strong>
              <button
                onClick={() =>
                  update("introParagraphs", [...content.introParagraphs, ""])
                }
                type="button"
              >
                + Add Paragraph
              </button>
            </div>
            {content.introParagraphs.map((paragraph, index) => (
              <div className="industry-editor-row" key={index}>
                <textarea
                  className="form-control"
                  value={paragraph}
                  onChange={(event) =>
                    update(`introParagraphs.${index}`, event.target.value)
                  }
                  placeholder="Introduction paragraph"
                />
                <button
                  onClick={() =>
                    update(
                      "introParagraphs",
                      content.introParagraphs.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                  type="button"
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {content.sections.map((section, sectionIndex) => (
        <section
          className="card about-page-card"
          key={`${section.id}-${sectionIndex}`}
        >
          <div className="card-body">
            <div className="about-page-admin__header-actions">
              <SectionHeading
                eyebrow={`Section ${sectionIndex + 1}`}
                title={section.title || "Untitled section"}
              />
              <button
                className="btn btn-outline-danger btn-sm ms-auto"
                onClick={() =>
                  update(
                    "sections",
                    content.sections.filter(
                      (_, index) => index !== sectionIndex,
                    ),
                  )
                }
                type="button"
              >
                Remove Section
              </button>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Section ID</label>
                <input
                  className="form-control"
                  value={section.id}
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      ...section,
                      id: event.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-8">
                <label className="form-label">Section Title</label>
                <input
                  className="form-control"
                  value={section.title}
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      ...section,
                      title: event.target.value,
                    })
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={section.description}
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      ...section,
                      description: event.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Optional markings heading</label>
                <input
                  className="form-control"
                  value={section.markingsHeading || ""}
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      ...section,
                      markingsHeading: event.target.value,
                    })
                  }
                  placeholder="BEE Star Label"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Optional markings footer note
                </label>
                <input
                  className="form-control"
                  value={section.footerNote || ""}
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      ...section,
                      footerNote: event.target.value,
                    })
                  }
                  placeholder="BIS Name Plate - ..."
                />
              </div>
            </div>

            <div className="industry-editor-list mb-4">
              <div className="industry-editor-list__head">
                <strong>Tables</strong>
                <button
                  onClick={() =>
                    update(`sections.${sectionIndex}.tables`, [
                      ...(section.tables || []),
                      {
                        type: "specification",
                        title: "",
                        subtitle: "",
                        footerText: "",
                        headers: [],
                        rows: [],
                      },
                    ])
                  }
                  type="button"
                >
                  + Add Table
                </button>
              </div>
              {(section.tables || []).map((table, tableIndex) => (
                <BisBeeTableEditor
                  key={tableIndex}
                  table={table}
                  onChange={(nextTable) =>
                    updateTable(sectionIndex, tableIndex, nextTable)
                  }
                  onRemove={() =>
                    update(
                      `sections.${sectionIndex}.tables`,
                      section.tables.filter((_, index) => index !== tableIndex),
                    )
                  }
                />
              ))}
            </div>

            <div className="industry-editor-list mb-4">
              <div className="industry-editor-list__head">
                <strong>Markings</strong>
                <button
                  onClick={() =>
                    update(`sections.${sectionIndex}.markings`, [
                      ...(section.markings || []),
                      { label: "", image: "", caption: "" },
                    ])
                  }
                  type="button"
                >
                  + Add Marking
                </button>
              </div>
              {(section.markings || []).map((marking, index) => (
                <div className="industry-editor-row" key={index}>
                  <div className="row g-2 w-100">
                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Label"
                        value={marking.label}
                        onChange={(event) =>
                          update(
                            `sections.${sectionIndex}.markings.${index}.label`,
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Media filename / URL"
                        value={marking.image}
                        onChange={(event) =>
                          update(
                            `sections.${sectionIndex}.markings.${index}.image`,
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Caption"
                        value={marking.caption}
                        onChange={(event) =>
                          update(
                            `sections.${sectionIndex}.markings.${index}.caption`,
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      update(
                        `sections.${sectionIndex}.markings`,
                        section.markings.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                    type="button"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            <div className="industry-editor-list">
              <div className="industry-editor-list__head">
                <strong>Links &amp; Documents</strong>
                <button
                  onClick={() =>
                    update(`sections.${sectionIndex}.links`, [
                      ...(section.links || []),
                      { title: "", url: "" },
                    ])
                  }
                  type="button"
                >
                  + Add Link
                </button>
              </div>
              {(section.links || []).map((link, index) => (
                <div className="industry-editor-row" key={index}>
                  <div className="row g-2 w-100">
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Document title"
                        value={link.title}
                        onChange={(event) =>
                          update(
                            `sections.${sectionIndex}.links.${index}.title`,
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Document URL"
                        value={link.url}
                        onChange={(event) =>
                          update(
                            `sections.${sectionIndex}.links.${index}.url`,
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      update(
                        `sections.${sectionIndex}.links`,
                        section.links.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                    type="button"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
      <button
        className="btn btn-outline-primary mb-4"
        onClick={() =>
          update("sections", [
            ...content.sections,
            {
              id: `section-${content.sections.length + 1}`,
              title: "",
              description: "",
              markingsHeading: "",
              footerNote: "",
              tables: [],
              markings: [],
              links: [],
            },
          ])
        }
        type="button"
      >
        + Add Category Section
      </button>
    </>
  );
}

export function GovtPolicyPageContent() {
  const params = useParams();
  const slug = params.slug || "bis-bee";
  const pageConfig =
    govtPolicyPages.find((page) => page.slug === slug) || govtPolicyPages[0];
  const isRichTextPage = pageConfig.slug === "atmanirbhar";
  const emptyValues = useMemo(() => {
    const initialValues = createGovtPolicyPageInitialValues(
      pageConfig.label,
      pageConfig.slug,
    );
    if (pageConfig.slug !== "atmanirbhar") return initialValues;
    return {
      ...initialValues,
      bannerSection: { title: "", highlightedTitle: "", image: "" },
      detailsSection: { ...initialValues.detailsSection, heading: "" },
      richContent: { html: "" },
      atmanirbharSections: [],
      seo: { metaTitle: "", metaDescription: "", keywords: [] },
    };
  }, [pageConfig.label, pageConfig.slug]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
    setFieldTouched,
    setValues,
  } = useFormik({
    initialValues: emptyValues,
    enableReinitialize: true,
    validationSchema: govtPolicyPageSchema,
    onSubmit: async (
      formValues: GovtPolicyPageValues,
      helpers: FormikHelpers<GovtPolicyPageValues>,
    ) => {
      setUpdating(true);
      try {
        const payload = normalizeValues(formValues);
        const apiResponse = hasExistingData
          ? await put(`/govtPolicyPages/${slug}`, payload)
          : await post(`/govtPolicyPages/${slug}`, payload, true);

        if (apiResponse?.status === 200) {
          toast.success(
            hasExistingData
              ? `${pageConfig.label} page data updated!`
              : `${pageConfig.label} page data created!`,
          );
          syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
        } else {
          helpers.setErrors(apiResponse?.errors);
          toast.error(
            apiResponse?.message || "Unable to save govt policy page",
          );
        }
      } catch (error) {
        console.error("Unable to save government policy page", error);
        toast.error("Unable to save government policy page");
      } finally {
        setUpdating(false);
      }
    },
  });

  const keywordsString = useMemo(
    () =>
      (values?.seo?.keywords || [])
        .map((keyword) => (keyword || "").trim())
        .filter(Boolean)
        .join(", "),
    [values?.seo?.keywords],
  );

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function syncSavedValues(body?: ApiBody, fallback?: GovtPolicyPageValues) {
    const nextValues = normalizeValues(
      migrateLegacyEngagementContent(
        migrateLegacyParagraphs(
          mergeGovtPageValues(
            emptyValues,
            body ? stripApiFields(body) : fallback,
            slug,
          ),
        ),
      ),
    );
    setValues(nextValues);
    setHasExistingData(Boolean(body?._id) || hasExistingData);
  }

  function migrateLegacyEngagementContent(
    valuesToMigrate: GovtPolicyPageValues,
  ): GovtPolicyPageValues {
    if (slug !== "govt-engagements" || !valuesToMigrate.sections?.length)
      return valuesToMigrate;
    const hasLegacyProposalData = valuesToMigrate.sections.some(
      (section) =>
        section.id === "inclusion-proposals" ||
        section.buttons?.some((button) =>
          button.title.toLowerCase().includes("consideration of"),
        ),
    );
    if (!hasLegacyProposalData) return valuesToMigrate;

    const referenceValues = createGovtEngagementDefaultValues();
    return {
      ...valuesToMigrate,
      hero: referenceValues.hero,
      introduction: referenceValues.introduction,
      issues: referenceValues.issues,
      sections: referenceValues.sections,
      seo: referenceValues.seo,
    };
  }

  function migrateLegacyParagraphs(
    valuesToMigrate: GovtPolicyPageValues,
  ): GovtPolicyPageValues {
    if (!valuesToMigrate || !valuesToMigrate.detailsSection)
      return valuesToMigrate;
    if (
      valuesToMigrate.detailsSection.introParagraphs &&
      valuesToMigrate.detailsSection.introParagraphs.length
    )
      return valuesToMigrate;
    return {
      ...valuesToMigrate,
      detailsSection: {
        ...valuesToMigrate.detailsSection,
        introParagraphs: valuesToMigrate.detailsSection.paragraphs || [],
      },
    };
  }

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      try {
        const apiResponse = await get(`/govtPolicyPages/${slug}`, true);
        if (apiResponse?.status === 200 && apiResponse.body) {
          const body = apiResponse.body as ApiBody;
          const nextValues = normalizeValues(
            migrateLegacyEngagementContent(
              migrateLegacyParagraphs(
                mergeGovtPageValues(emptyValues, stripApiFields(body), slug),
              ),
            ),
          );
          setValues(nextValues);
          setHasExistingData(Boolean(body._id));
        } else {
          setValues(emptyValues);
          setHasExistingData(false);
          if (apiResponse?.message) toast.error(apiResponse.message);
        }
      } catch (error) {
        console.error("Unable to load government policy page", error);
        setValues(emptyValues);
        setHasExistingData(false);
        toast.error("Unable to load government policy page");
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [emptyValues, setValues, slug]);

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
    Array.from(files).forEach((file) => {
      if (["image/jpeg", "image/png", "image/webp"].includes(file.type))
        formData.append("files", file);
      else toast.error("Only JPG, PNG, and WEBP images are allowed.");
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
        setRecords((old) => [...apiData.body, ...old]);
        toast.success(apiData.message || "Image uploaded successfully");
      } else toast.error(apiData.message || "Unable to upload image");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload image",
      );
    }
    event.target.value = "";
  }

  function handleSelectMedia(filename: string) {
    if (selectedFileFor === "__richContentImage") {
      const imageHtml = `<p><img src="${addUrlToFile(filename)}" alt="" /></p>`;
      void setFieldValue(
        "richContent.html",
        `${values.richContent?.html || ""}${imageHtml}`,
      );
      return;
    }
    void setFieldValue(selectedFileFor, filename);
  }

  return (
    <div className="content-wrapper about-page-admin past-chairmen-admin-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">
              {slug === "bis-bee" ? "Pages" : "Govt Policies"}
            </span>
          </div>
          <h1>{pageConfig.label}</h1>
          <p>
            {slug === "bis-bee"
              ? "Manage introduction, category sections, specifications, ratings, markings, documents, and SEO."
              : "Manage banner image, page text, CTA button, and SEO. Header and footer stay separate."}
          </p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}
      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            {slug === "bis-bee" ? (
              <BisBeeEditor values={values} setFieldValue={setFieldValue} />
            ) : null}
            {slug !== "bis-bee" ? (
              slug === "govt-engagements" ? (
                <>
                  {/* Hero Section */}
                  <section className="card about-page-card">
                    <div className="card-body">
                      <SectionHeading
                        eyebrow="Hero / Banner"
                        title="Header & Banner Section"
                      />
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Hero Title</label>
                          <input
                            className="form-control"
                            name="hero.title"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Government"
                            value={values.hero?.title || ""}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">
                            Highlighted Title
                          </label>
                          <input
                            className="form-control"
                            name="hero.highlightedTitle"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Engagements"
                            value={values.hero?.highlightedTitle || ""}
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Banner Image</label>
                          <div className="about-page-image-field is-wide">
                            {values.hero?.bannerImage?.url ? (
                              <button
                                aria-label="Clear banner image"
                                className="about-page-image-clear"
                                onClick={() =>
                                  setFieldValue("hero.bannerImage.url", "")
                                }
                                type="button"
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            ) : null}
                            <button
                              className="about-page-image-picker"
                              data-bs-target="#selectGovtPolicyImageFileModal"
                              data-bs-toggle="modal"
                              onClick={() =>
                                setSelectedFileFor("hero.bannerImage.url")
                              }
                              type="button"
                            >
                              <img
                                src={
                                  values.hero?.bannerImage?.url
                                    ? addUrlToFile(values.hero.bannerImage.url)
                                    : "/images/select-photo.png"
                                }
                                alt="Banner"
                              />
                              <span>Select Hero Banner Image</span>
                            </button>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">
                            Banner Image Alt Text
                          </label>
                          <input
                            className="form-control"
                            name="hero.bannerImage.alt"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Government Engagements banner"
                            value={values.hero?.bannerImage?.alt || ""}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Introduction Section */}
                  <section className="card about-page-card">
                    <div className="card-body">
                      <SectionHeading
                        eyebrow="Lead Section"
                        title="Policy Advocacy Introduction"
                      />
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <label className="form-label">Eyebrow</label>
                          <input
                            className="form-control"
                            name="introduction.eyebrow"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.introduction?.eyebrow || ""}
                            placeholder="POLICY ADVOCACY"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Main Heading</label>
                          <input
                            className="form-control"
                            name="introduction.title"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.introduction?.title || ""}
                            placeholder="Representing the industry"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">
                            Highlighted Heading
                          </label>
                          <input
                            className="form-control"
                            name="introduction.highlightedTitle"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.introduction?.highlightedTitle || ""}
                            placeholder="before government"
                          />
                        </div>
                        <div className="col-md-8">
                          <label className="form-label">Lead Paragraph</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            name="introduction.body"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.introduction?.body || ""}
                            placeholder="Lead paragraph"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Concerns Heading</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            name="introduction.concernsHeading"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.introduction?.concernsHeading || ""}
                            placeholder="IFMA's concerns raised before BEE included:"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Issues Section */}
                  <section className="card about-page-card">
                    <div className="card-body">
                      <SectionHeading
                        eyebrow="Issues & Risks"
                        title="Supply Side vs Demand Risk Issues"
                      />
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <label className="form-label">
                            Engagement Eyebrow
                          </label>
                          <input
                            className="form-control"
                            name="issues.eyebrow"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.issues?.eyebrow || ""}
                            placeholder="Engagement 01 - BEE"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Main Heading</label>
                          <input
                            className="form-control"
                            name="issues.title"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.issues?.title || ""}
                            placeholder="Deferment of star"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">
                            Highlighted Heading
                          </label>
                          <input
                            className="form-control"
                            name="issues.highlightedTitle"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.issues?.highlightedTitle || ""}
                            placeholder="labelling requirements"
                          />
                        </div>
                        <div className="col-md-8">
                          <label className="form-label">
                            Engagement Introduction
                          </label>
                          <textarea
                            className="form-control"
                            rows={2}
                            name="issues.description"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.issues?.description || ""}
                          />
                        </div>
                      </div>
                      <div className="row g-4">
                        {/* Supply Side */}
                        <div className="col-md-6">
                          <div className="p-3 border rounded">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="mb-0 font-weight-bold">
                                Supply Side Issues
                              </h5>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  setFieldValue("issues.supplySide.points", [
                                    ...(values.issues?.supplySide?.points ||
                                      []),
                                    { text: "" },
                                  ])
                                }
                                type="button"
                              >
                                + Add Issue
                              </button>
                            </div>
                            <div className="form-group">
                              <label>Section Title</label>
                              <input
                                className="form-control"
                                name="issues.supplySide.title"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.issues?.supplySide?.title || ""}
                              />
                            </div>
                            <div className="industry-editor-list">
                              {(values.issues?.supplySide?.points || []).map(
                                (point, pIndex) => (
                                  <div
                                    className="industry-editor-row"
                                    key={pIndex}
                                  >
                                    <div className="row g-2 w-100">
                                      <div className="col-md-5">
                                        <input
                                          className="form-control"
                                          name={`issues.supplySide.points.${pIndex}.label`}
                                          onBlur={handleBlur}
                                          onChange={handleChange}
                                          placeholder="Bold label"
                                          value={point.label || ""}
                                        />
                                      </div>
                                      <div className="col-md-7">
                                        <input
                                          className="form-control"
                                          name={`issues.supplySide.points.${pIndex}.text`}
                                          onBlur={handleBlur}
                                          onChange={handleChange}
                                          placeholder="Description"
                                          value={point.text}
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        setFieldValue(
                                          "issues.supplySide.points",
                                          (
                                            values.issues?.supplySide?.points ||
                                            []
                                          ).filter((_, idx) => idx !== pIndex),
                                        )
                                      }
                                      type="button"
                                    >
                                      <i className="fa fa-times"></i>
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Demand Side */}
                        <div className="col-md-6">
                          <div className="p-3 border rounded">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="mb-0 font-weight-bold">
                                Demand Side Issues
                              </h5>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  setFieldValue("issues.demandSide.points", [
                                    ...(values.issues?.demandSide?.points ||
                                      []),
                                    { text: "" },
                                  ])
                                }
                                type="button"
                              >
                                + Add Issue
                              </button>
                            </div>
                            <div className="form-group">
                              <label>Section Title</label>
                              <input
                                className="form-control"
                                name="issues.demandSide.title"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.issues?.demandSide?.title || ""}
                              />
                            </div>
                            <div className="industry-editor-list">
                              {(values.issues?.demandSide?.points || []).map(
                                (point, pIndex) => (
                                  <div
                                    className="industry-editor-row"
                                    key={pIndex}
                                  >
                                    <div className="row g-2 w-100">
                                      <div className="col-md-5">
                                        <input
                                          className="form-control"
                                          name={`issues.demandSide.points.${pIndex}.label`}
                                          onBlur={handleBlur}
                                          onChange={handleChange}
                                          placeholder="Bold label"
                                          value={point.label || ""}
                                        />
                                      </div>
                                      <div className="col-md-7">
                                        <input
                                          className="form-control"
                                          name={`issues.demandSide.points.${pIndex}.text`}
                                          onBlur={handleBlur}
                                          onChange={handleChange}
                                          placeholder="Description"
                                          value={point.text}
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        setFieldValue(
                                          "issues.demandSide.points",
                                          (
                                            values.issues?.demandSide?.points ||
                                            []
                                          ).filter((_, idx) => idx !== pIndex),
                                        )
                                      }
                                      type="button"
                                    >
                                      <i className="fa fa-times"></i>
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Dynamic Content Sections Manager */}
                  <section className="card about-page-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <SectionHeading
                          eyebrow="Page Content Sections"
                          title="Custom Sections, Tables & Cards"
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            setFieldValue("sections", [
                              ...(values.sections || []),
                              {
                                id: `section-${Date.now()}`,
                                title: "",
                                description: "",
                                buttons: [],
                                cards: [],
                                table: { title: "", headers: [], rows: [] },
                              },
                            ])
                          }
                          type="button"
                        >
                          + Add Section
                        </button>
                      </div>
                      {(values.sections || []).map((section, sIndex) => (
                        <div
                          className="p-3 border rounded mb-4 bg-light"
                          key={sIndex}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <strong className="text-primary fs-5">
                              Section #{sIndex + 1}:{" "}
                              {section.title || "Untitled Section"}
                            </strong>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                setFieldValue(
                                  "sections",
                                  (values.sections || []).filter(
                                    (_, idx) => idx !== sIndex,
                                  ),
                                )
                              }
                              type="button"
                            >
                              <i className="fa fa-trash"></i> Remove Section
                            </button>
                          </div>
                          <div className="form-group">
                            <label>Section ID / Anchor</label>
                            <input
                              className="form-control"
                              name={`sections.${sIndex}.id`}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. gst-relaxation"
                              value={section.id}
                            />
                          </div>
                          <div className="row g-3">
                            <div className="col-md-4">
                              <label>Section Eyebrow</label>
                              <input
                                className="form-control"
                                name={`sections.${sIndex}.eyebrow`}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Engagement 02 - BEE"
                                value={section.eyebrow || ""}
                              />
                            </div>
                            <div className="col-md-4">
                              <label>Main Heading</label>
                              <input
                                className="form-control"
                                name={`sections.${sIndex}.title`}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Inclusion of"
                                value={section.title}
                              />
                            </div>
                            <div className="col-md-4">
                              <label>Highlighted Heading</label>
                              <input
                                className="form-control"
                                name={`sections.${sIndex}.highlightedTitle`}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="all sweeps for ceiling fans"
                                value={section.highlightedTitle || ""}
                              />
                            </div>
                          </div>
                          {section.id !== "imports" ? (
                            <div className="form-group">
                              <label>Section Description / Paragraphs</label>
                              <textarea
                                className="form-control"
                                rows={4}
                                name={`sections.${sIndex}.description`}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Detailed text content..."
                                value={section.description}
                              />
                            </div>
                          ) : null}
                          {section.id === "gst" ? (
                            <div className="form-group">
                              <label>Pillars Heading</label>
                              <input
                                className="form-control"
                                name={`sections.${sIndex}.pillarsHeading`}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="IFMA's request rests on 5 key pillars:"
                                value={section.pillarsHeading || ""}
                              />
                            </div>
                          ) : null}
                          {section.id === "imports" ? (
                            <div className="mt-4 mb-3 border p-2 bg-white rounded">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <strong>Section Paragraphs</strong>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    setFieldValue(
                                      `sections.${sIndex}.paragraphs`,
                                      [
                                        ...(section.paragraphs || []),
                                        { text: "", style: "normal" },
                                      ],
                                    )
                                  }
                                  type="button"
                                >
                                  + Add Paragraph
                                </button>
                              </div>
                              {(section.paragraphs || []).map(
                                (paragraph, pIndex) => (
                                  <div
                                    className="row g-2 mb-2 align-items-start"
                                    key={pIndex}
                                  >
                                    <div className="col-md-3">
                                      <label className="form-label small mb-1">
                                        Display Style
                                      </label>
                                      <select
                                        className="form-select form-select-sm"
                                        name={`sections.${sIndex}.paragraphs.${pIndex}.style`}
                                        onChange={handleChange}
                                        value={paragraph.style}
                                      >
                                        <option value="normal">Normal</option>
                                        <option value="highlighted">
                                          Highlighted
                                        </option>
                                      </select>
                                    </div>
                                    <div className="col-md-8">
                                      <label className="form-label small mb-1">
                                        Paragraph Text
                                      </label>
                                      <textarea
                                        className="form-control form-control-sm"
                                        rows={3}
                                        name={`sections.${sIndex}.paragraphs.${pIndex}.text`}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="Paragraph text"
                                        value={paragraph.text}
                                      />
                                    </div>
                                    <div className="col-md-1 pt-4">
                                      <button
                                        className="btn btn-sm btn-outline-danger w-100"
                                        onClick={() =>
                                          setFieldValue(
                                            `sections.${sIndex}.paragraphs`,
                                            (section.paragraphs || []).filter(
                                              (_, idx) => idx !== pIndex,
                                            ),
                                          )
                                        }
                                        type="button"
                                        aria-label="Remove paragraph"
                                      >
                                        <i className="fa fa-times"></i>
                                      </button>
                                    </div>
                                  </div>
                                ),
                              )}
                              {!(section.paragraphs || []).length ? (
                                <div className="text-muted small">
                                  Add normal or highlighted paragraphs for this
                                  section.
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {/* Highlight Callout Buttons */}
                          <div className="mb-3 border p-2 bg-white rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <strong>Callout / Highlight Boxes</strong>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  setFieldValue(`sections.${sIndex}.buttons`, [
                                    ...(section.buttons || []),
                                    {
                                      title: "",
                                      note: "",
                                      subtitle: "",
                                      url: "",
                                    },
                                  ])
                                }
                                type="button"
                              >
                                + Add Box
                              </button>
                            </div>
                            {(section.buttons || []).map((btn, bIndex) => (
                              <div
                                className="row g-2 mb-2 align-items-center"
                                key={bIndex}
                              >
                                <div className="col-md-4">
                                  <input
                                    className="form-control form-control-sm"
                                    style={{
                                      fontSize: "1rem",
                                      fontWeight: 600,
                                    }}
                                    name={`sections.${sIndex}.buttons.${bIndex}.title`}
                                    onChange={handleChange}
                                    placeholder="Main title"
                                    value={btn.title}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <input
                                    className="form-control form-control-sm text-muted"
                                    style={{ fontSize: "0.82rem" }}
                                    name={`sections.${sIndex}.buttons.${bIndex}.note`}
                                    onChange={handleChange}
                                    placeholder="Small note"
                                    value={btn.note || ""}
                                  />
                                </div>
                                <div className="col-md-4">
                                  <input
                                    className="form-control form-control-sm"
                                    name={`sections.${sIndex}.buttons.${bIndex}.subtitle`}
                                    onChange={handleChange}
                                    placeholder="Box subtitle"
                                    value={btn.subtitle}
                                  />
                                </div>
                                <div className="col-md-1">
                                  <button
                                    className="btn btn-sm btn-outline-danger w-100"
                                    onClick={() =>
                                      setFieldValue(
                                        `sections.${sIndex}.buttons`,
                                        (section.buttons || []).filter(
                                          (_, idx) => idx !== bIndex,
                                        ),
                                      )
                                    }
                                    type="button"
                                  >
                                    <i className="fa fa-times"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {section.id !== "sweeps" &&
                          !section.table?.headers?.length ? (
                            <>
                              {/* Cards Grid */}
                              <div className="mb-3 border p-2 bg-white rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <strong>
                                    Cards Grid (e.g. GST Rationalization
                                    Pillars)
                                  </strong>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() =>
                                      setFieldValue(
                                        `sections.${sIndex}.cards`,
                                        [
                                          ...(section.cards || []),
                                          {
                                            title: "",
                                            description: "",
                                            points: [],
                                          },
                                        ],
                                      )
                                    }
                                    type="button"
                                  >
                                    + Add Card
                                  </button>
                                </div>
                                {(section.cards || []).map(
                                  (cardItem, cIndex) => (
                                    <div
                                      className="border p-2 mb-2 rounded bg-light"
                                      key={cIndex}
                                    >
                                      <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-bold">
                                          Card #{cIndex + 1}
                                        </span>
                                        <button
                                          className="btn btn-sm text-danger"
                                          onClick={() =>
                                            setFieldValue(
                                              `sections.${sIndex}.cards`,
                                              (section.cards || []).filter(
                                                (_, idx) => idx !== cIndex,
                                              ),
                                            )
                                          }
                                          type="button"
                                        >
                                          <i className="fa fa-times"></i>
                                        </button>
                                      </div>
                                      <div className="form-group mb-2">
                                        <input
                                          className="form-control form-control-sm"
                                          name={`sections.${sIndex}.cards.${cIndex}.title`}
                                          onChange={handleChange}
                                          placeholder="Card title"
                                          value={cardItem.title}
                                        />
                                      </div>
                                      <div className="form-group mb-0">
                                        <input
                                          className="form-control form-control-sm"
                                          name={`sections.${sIndex}.cards.${cIndex}.description`}
                                          onChange={handleChange}
                                          placeholder="Card description"
                                          value={cardItem.description}
                                        />
                                      </div>
                                      <div className="mt-2">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                          <small className="text-muted">
                                            Card points
                                          </small>
                                          <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() =>
                                              setFieldValue(
                                                `sections.${sIndex}.cards.${cIndex}.points`,
                                                [
                                                  ...(cardItem.points || []),
                                                  "",
                                                ],
                                              )
                                            }
                                            type="button"
                                          >
                                            + Add Point
                                          </button>
                                        </div>
                                        {(cardItem.points || []).map(
                                          (point, pointIndex) => (
                                            <div
                                              className="d-flex gap-2 mb-2"
                                              key={pointIndex}
                                            >
                                              <input
                                                className="form-control form-control-sm"
                                                name={`sections.${sIndex}.cards.${cIndex}.points.${pointIndex}`}
                                                onChange={handleChange}
                                                placeholder="Point text"
                                                value={point}
                                              />
                                              <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                  setFieldValue(
                                                    `sections.${sIndex}.cards.${cIndex}.points`,
                                                    (
                                                      cardItem.points || []
                                                    ).filter(
                                                      (_, idx) =>
                                                        idx !== pointIndex,
                                                    ),
                                                  )
                                                }
                                                type="button"
                                              >
                                                <i className="fa fa-times"></i>
                                              </button>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </>
                          ) : null}

                          {section.id === "sweeps" ||
                          Boolean(section.table?.headers?.length) ? (
                            <>
                              {/* Performance Table */}
                              <div className="border p-2 bg-white rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <strong>
                                    Data Table (e.g. Ceiling Fan Attributes /
                                    Pre-Budget Memo)
                                  </strong>
                                </div>
                                <div className="form-group mb-2">
                                  <label>Table Title</label>
                                  <input
                                    className="form-control form-control-sm"
                                    name={`sections.${sIndex}.table.title`}
                                    onChange={handleChange}
                                    placeholder="e.g. TABLE 1: REVISED ATTRIBUTES"
                                    value={section.table?.title || ""}
                                  />
                                </div>
                                <div className="form-group mb-2">
                                  <label>Headers (comma-separated)</label>
                                  <input
                                    className="form-control form-control-sm"
                                    onChange={(e) =>
                                      setFieldValue(
                                        `sections.${sIndex}.table.headers`,
                                        e.target.value
                                          .split(",")
                                          .map((h) => h.trim()),
                                      )
                                    }
                                    placeholder="Category, Recommendation, Rationale"
                                    value={(section.table?.headers || []).join(
                                      ", ",
                                    )}
                                  />
                                </div>
                                <div className="mb-2">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="mb-0">Table Rows</label>
                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() =>
                                        setFieldValue(
                                          `sections.${sIndex}.table.rows`,
                                          [
                                            ...(section.table?.rows || []),
                                            new Array(
                                              section.table?.headers?.length ||
                                                3,
                                            ).fill(""),
                                          ],
                                        )
                                      }
                                      type="button"
                                    >
                                      + Add Row
                                    </button>
                                  </div>
                                  {(section.table?.rows || []).map(
                                    (rowArray, rIndex) => (
                                      <div
                                        className="d-flex gap-2 mb-2 align-items-center"
                                        key={rIndex}
                                      >
                                        {rowArray.map((cell, cellIdx) => (
                                          <input
                                            className="form-control form-control-sm"
                                            key={cellIdx}
                                            onChange={(e) => {
                                              const nextRows = [
                                                ...(section.table?.rows || []),
                                              ];
                                              const nextRow = [
                                                ...nextRows[rIndex],
                                              ];
                                              nextRow[cellIdx] = e.target.value;
                                              nextRows[rIndex] = nextRow;
                                              setFieldValue(
                                                `sections.${sIndex}.table.rows`,
                                                nextRows,
                                              );
                                            }}
                                            placeholder={`Col ${cellIdx + 1}`}
                                            value={cell}
                                          />
                                        ))}
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() =>
                                            setFieldValue(
                                              `sections.${sIndex}.table.rows`,
                                              (
                                                section.table?.rows || []
                                              ).filter(
                                                (_, idx) => idx !== rIndex,
                                              ),
                                            )
                                          }
                                          type="button"
                                        >
                                          <i className="fa fa-times"></i>
                                        </button>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="card about-page-card">
                    <div className="card-body">
                      <SectionHeading
                        eyebrow="Govt Policies"
                        title="Banner Section"
                      />
                      <div className="about-page-simple-grid">
                        <div className="about-page-field-grid">
                          <input
                            className="form-control"
                            name="name"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Page name"
                            value={values.name}
                          />
                          <input
                            className="form-control"
                            name="bannerSection.title"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="BIS"
                            value={values.bannerSection.title}
                          />
                          <input
                            className="form-control"
                            name="bannerSection.highlightedTitle"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Specifications"
                            value={values.bannerSection.highlightedTitle}
                          />
                        </div>
                        <div className="about-page-image-field is-wide">
                          {values.bannerSection.image ? (
                            <button
                              aria-label="Clear banner image"
                              className="about-page-image-clear"
                              onClick={() =>
                                setFieldValue("bannerSection.image", "")
                              }
                              type="button"
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          ) : null}
                          <button
                            className="about-page-image-picker"
                            data-bs-target="#selectGovtPolicyImageFileModal"
                            data-bs-toggle="modal"
                            onClick={() =>
                              setSelectedFileFor("bannerSection.image")
                            }
                            type="button"
                          >
                            <img
                              src={
                                values.bannerSection.image
                                  ? addUrlToFile(values.bannerSection.image)
                                  : "/images/select-photo.png"
                              }
                              alt="Govt policy banner"
                            />
                            <span>Select banner image</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {isRichTextPage ? (
                    <section className="card about-page-card">
                      <div className="card-body">
                        <SectionHeading
                          eyebrow="Govt Policies"
                          title="Content Sections"
                        />
                        <AtmanirbharSectionsEditor
                          values={values}
                          setFieldValue={setFieldValue}
                        />
                      </div>
                    </section>
                  ) : (
                    <>
                      <section className="card about-page-card">
                        <div className="card-body">
                          <SectionHeading
                            eyebrow="Govt Policies"
                            title="Content Section"
                          />
                          <input
                            className="form-control mb-3"
                            name="detailsSection.heading"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Page heading"
                            value={values.detailsSection.heading}
                          />
                          <div className="industry-editor-list">
                            <div className="industry-editor-list__head">
                              <strong>Intro Paragraphs</strong>
                              <button
                                onClick={() =>
                                  setFieldValue(
                                    "detailsSection.introParagraphs",
                                    [
                                      ...values.detailsSection.introParagraphs,
                                      "",
                                    ],
                                  )
                                }
                                type="button"
                              >
                                + Add Paragraph
                              </button>
                            </div>
                            {values.detailsSection.introParagraphs.map(
                              (paragraph, index) => (
                                <div
                                  className="industry-editor-row"
                                  key={index}
                                >
                                  <textarea
                                    className="form-control"
                                    name={`detailsSection.introParagraphs.${index}`}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="Paragraph text"
                                    value={paragraph}
                                  />
                                  <button
                                    onClick={() =>
                                      setFieldValue(
                                        "detailsSection.introParagraphs",
                                        values.detailsSection.introParagraphs.filter(
                                          (_, itemIndex) => itemIndex !== index,
                                        ),
                                      )
                                    }
                                    type="button"
                                  >
                                    <i className="fa fa-times"></i>
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </section>

                      <section className="card about-page-card">
                        <div className="card-body">
                          <SectionHeading
                            eyebrow="Govt Policies"
                            title="Bullet Section"
                          />
                          <input
                            className="form-control mb-3"
                            name="detailsSection.bulletHeading"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="BEE performs regulatory and promotional functions including:"
                            value={values.detailsSection.bulletHeading}
                          />
                          <div className="industry-editor-list">
                            <div className="industry-editor-list__head">
                              <strong>Bullet Points</strong>
                              <button
                                onClick={() =>
                                  setFieldValue("detailsSection.bullets", [
                                    ...values.detailsSection.bullets,
                                    "",
                                  ])
                                }
                                type="button"
                              >
                                + Add Bullet
                              </button>
                            </div>
                            {values.detailsSection.bullets.map(
                              (bullet, index) => (
                                <div
                                  className="industry-editor-row"
                                  key={index}
                                >
                                  <textarea
                                    className="form-control"
                                    name={`detailsSection.bullets.${index}`}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="Bullet text"
                                    value={bullet}
                                  />
                                  <button
                                    onClick={() =>
                                      setFieldValue(
                                        "detailsSection.bullets",
                                        values.detailsSection.bullets.filter(
                                          (_, itemIndex) => itemIndex !== index,
                                        ),
                                      )
                                    }
                                    type="button"
                                  >
                                    <i className="fa fa-times"></i>
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </section>

                      <section className="card about-page-card">
                        <div className="card-body">
                          <SectionHeading
                            eyebrow="Govt Policies"
                            title="Bottom Paragraphs"
                          />
                          <div className="industry-editor-list">
                            <div className="industry-editor-list__head">
                              <strong>Bottom Paragraphs</strong>
                              <button
                                onClick={() =>
                                  setFieldValue(
                                    "detailsSection.bottomParagraphs",
                                    [
                                      ...values.detailsSection.bottomParagraphs,
                                      { text: "", isItalic: false },
                                    ],
                                  )
                                }
                                type="button"
                              >
                                + Add Paragraph
                              </button>
                            </div>
                            {values.detailsSection.bottomParagraphs.map(
                              (paragraph, index) => (
                                <div
                                  className="industry-editor-row"
                                  key={index}
                                >
                                  <div className="w-100">
                                    <textarea
                                      className="form-control"
                                      name={`detailsSection.bottomParagraphs.${index}.text`}
                                      onBlur={handleBlur}
                                      onChange={handleChange}
                                      placeholder="Paragraph text"
                                      value={paragraph.text}
                                    />
                                    <label className="d-flex align-items-center gap-2 mt-2 mb-0">
                                      <input
                                        checked={paragraph.isItalic}
                                        name={`detailsSection.bottomParagraphs.${index}.isItalic`}
                                        onChange={(event) =>
                                          setFieldValue(
                                            `detailsSection.bottomParagraphs.${index}.isItalic`,
                                            event.target.checked,
                                          )
                                        }
                                        type="checkbox"
                                      />
                                      Italic text
                                    </label>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setFieldValue(
                                        "detailsSection.bottomParagraphs",
                                        values.detailsSection.bottomParagraphs.filter(
                                          (_, itemIndex) => itemIndex !== index,
                                        ),
                                      )
                                    }
                                    type="button"
                                  >
                                    <i className="fa fa-times"></i>
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </section>

                      <section className="card about-page-card">
                        <div className="card-body">
                          <SectionHeading
                            eyebrow="Govt Policies"
                            title="CTA Button"
                          />
                          <div className="industry-link-grid">
                            <div className="industry-link-card">
                              <input
                                className="form-control"
                                name="detailsSection.cta.label"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="Read more on this BIS link"
                                value={values.detailsSection.cta.label}
                              />
                              <input
                                className="form-control"
                                name="detailsSection.cta.url"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                placeholder="URL"
                                value={values.detailsSection.cta.url}
                              />
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  )}
                </>
              )
            ) : null}

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
                <strong>{pageConfig.label}</strong>
                <span>Save govt policy page content.</span>
              </div>
              <SubmitButton loading={updating} text="Update Page" />
            </div>
          </main>
        </div>
      </form>

      <div
        className="modal fade"
        id="selectGovtPolicyImageFileModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectGovtPolicyImageFileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5 me-2"
                id="selectGovtPolicyImageFileModalLabel"
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
                  <div
                    className="col-md-2 col-4"
                    key={item._id || item.filename}
                  >
                    <button
                      className="about-page-media-card"
                      data-bs-dismiss="modal"
                      onClick={() => handleSelectMedia(item.filename)}
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
