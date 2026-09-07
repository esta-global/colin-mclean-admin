import { FormikHelpers, useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, Pagination, SubmitButton } from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";
import {
  HeaderManagementValues,
  createEmptyChildMenuItem,
  createEmptyMenuItem,
  createEmptySubChildMenuItem,
  headerManagementInitialValues,
  headerManagementSchema,
} from "../../validationSchemas/headerManagementSchema";

type ApiBody = Partial<HeaderManagementValues> & {
  _id?: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
};

type MediaRecord = { _id?: string; filename: string };

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

function stripApiFields(data: ApiBody): Partial<HeaderManagementValues> {
  const payload = { ...data };
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;
  return payload;
}

function normalizeValues(values: HeaderManagementValues): HeaderManagementValues {
  return {
    ...values,
    logo: values.logo.trim(),
    logoAlt: values.logoAlt.trim(),
    menuItems: values.menuItems
      .map((item, index) => ({
        label: item.label.trim(),
        link: item.link.trim(),
        sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
        status: Boolean(item.status),
        children: (Array.isArray(item.children) ? item.children : [])
          .map((child, childIndex) => {
            const subChildren = Array.isArray(child.children) ? child.children : [];
            return {
            label: child.label.trim(),
            link: child.link.trim(),
            sortOrder: Number.isFinite(Number(child.sortOrder)) ? Number(child.sortOrder) : childIndex + 1,
            status: Boolean(child.status),
            children: subChildren
              .map((subChild, subChildIndex) => ({
                label: subChild.label.trim(),
                link: subChild.link.trim(),
                sortOrder: Number.isFinite(Number(subChild.sortOrder)) ? Number(subChild.sortOrder) : subChildIndex + 1,
                status: Boolean(subChild.status),
              }))
              .filter((subChild) => subChild.label || subChild.link)
              .sort((first, second) => first.sortOrder - second.sortOrder),
            };
          })
          .filter((child) => child.label || child.link || child.children.length)
          .sort((first, second) => first.sortOrder - second.sortOrder),
      }))
      .filter((item) => item.label || item.link)
      .sort((first, second) => first.sortOrder - second.sortOrder),
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

export function HeaderManagementContent() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 60, totalRecords: 0, totalPages: 0 });

  const { values, handleBlur, handleChange, handleSubmit, setFieldValue, setValues } = useFormik({
    initialValues: headerManagementInitialValues,
    validationSchema: headerManagementSchema,
    onSubmit: async (formValues: HeaderManagementValues, helpers: FormikHelpers<HeaderManagementValues>) => {
      setUpdating(true);
      const payload = normalizeValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/headerManagement", payload)
        : await post("/headerManagement", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Header saved successfully");
        syncSavedValues(apiResponse.body as ApiBody | undefined, payload);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save header");
      }
      setUpdating(false);
    },
  });

  function syncSavedValues(body?: ApiBody, fallback?: HeaderManagementValues) {
    const nextValues = normalizeValues(mergeValues(headerManagementInitialValues, body ? stripApiFields(body) : fallback));
    setValues(nextValues);
    setHasExistingData(Boolean(body) || hasExistingData);
  }

  useEffect(() => {
    async function fetchHeader() {
      setLoading(true);
      const apiResponse = await get("/headerManagement?default=true", true);
      if (apiResponse?.status === 200 && apiResponse.body) {
        syncSavedValues(apiResponse.body as ApiBody);
        setHasExistingData(true);
      } else {
        setValues(headerManagementInitialValues);
        setHasExistingData(false);
      }
      setLoading(false);
    }
    fetchHeader();
  }, [setValues]);

  useEffect(() => {
    async function fetchMedia() {
      let url = `/media?page=${pagination.page}&limit=${pagination.limit}&fileType=IMAGE`;
      if (searchQuery.trim()) url += `&searchQuery=${searchQuery.trim()}`;
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

  function renderMediaThumb(filename: string) {
    const mediaUrl = addUrlToFile(filename);
    if (getMediaType(mediaUrl) === "image") return <img src={mediaUrl} alt={filename} />;
    return (
      <div className="media-library-file py-4">
        <i className="fa fa-file"></i>
        <small className="d-block mt-2 text-truncate">{filename}</small>
      </div>
    );
  }

  function addMenuItem() {
    void setFieldValue("menuItems", [
      ...values.menuItems,
      createEmptyMenuItem(values.menuItems.length + 1),
    ]);
  }

  function removeMenuItem(index: number) {
    void setFieldValue(
      "menuItems",
      values.menuItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function addChild(menuIndex: number) {
    const menuItems = [...values.menuItems];
    const children = Array.isArray(menuItems[menuIndex].children) ? menuItems[menuIndex].children : [];
    menuItems[menuIndex] = {
      ...menuItems[menuIndex],
      children: [
        ...children,
        createEmptyChildMenuItem(children.length + 1),
      ],
    };
    void setFieldValue("menuItems", menuItems);
  }

  function removeChild(menuIndex: number, childIndex: number) {
    const menuItems = [...values.menuItems];
    menuItems[menuIndex] = {
      ...menuItems[menuIndex],
      children: menuItems[menuIndex].children.filter((_, itemIndex) => itemIndex !== childIndex),
    };
    void setFieldValue("menuItems", menuItems);
  }

  function addSubChild(menuIndex: number, childIndex: number) {
    const menuItems = [...values.menuItems];
    const child = menuItems[menuIndex].children[childIndex];
    const children = Array.isArray(child.children) ? child.children : [];
    menuItems[menuIndex].children[childIndex] = {
      ...child,
      children: [
        ...children,
        createEmptySubChildMenuItem(children.length + 1),
      ],
    };
    void setFieldValue("menuItems", menuItems);
  }

  function removeSubChild(menuIndex: number, childIndex: number, subChildIndex: number) {
    const menuItems = [...values.menuItems];
    const child = menuItems[menuIndex].children[childIndex];
    menuItems[menuIndex].children[childIndex] = {
      ...child,
      children: (Array.isArray(child.children) ? child.children : []).filter((_, itemIndex) => itemIndex !== subChildIndex),
    };
    void setFieldValue("menuItems", menuItems);
  }

  return (
    <div className="content-wrapper about-page-admin header-management-page">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Site Header</span>
          </div>
          <h1>Header Management</h1>
          <p>Manage the site logo, navigation menu, and child links.</p>
        </div>
      </div>
      {loading ? <OverlayLoading /> : null}

      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Brand" title="Logo" />
                <div className="header-logo-grid">
                  <div className="about-page-image-field is-wide">
                    <button className="about-page-image-picker header-logo-picker" data-bs-target="#selectHeaderLogoModal" data-bs-toggle="modal" type="button">
                      <img src={values.logo ? addUrlToFile(values.logo) : "/images/select-photo.png"} alt={values.logoAlt || "Header logo"} />
                      <span>Select logo</span>
                    </button>
                  </div>
                  <div className="form-group mb-0">
                    <label>Logo Alt Text</label>
                    <input className="form-control" name="logoAlt" onBlur={handleBlur} onChange={handleChange} placeholder="Indian Fan Manufacturers Association" value={values.logoAlt} />
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="industry-editor-list__head">
                  <SectionHeading eyebrow="Navigation" title="Menu Items" />
                  <button className="report-add-button" onClick={addMenuItem} type="button">
                    <i className="fa fa-plus"></i>
                    <span>Add Menu</span>
                  </button>
                </div>

                <div className="header-menu-list">
                  {values.menuItems.map((item, menuIndex) => (
                    <article className="header-menu-card" key={menuIndex}>
                      <div className="header-menu-card__top">
                        <strong>{item.label || "New menu item"}</strong>
                        <div>
                          <label className="report-toggle">
                            <input checked={item.status} name={`menuItems.${menuIndex}.status`} onChange={(event) => setFieldValue(`menuItems.${menuIndex}.status`, event.target.checked)} type="checkbox" />
                            <span>Active</span>
                          </label>
                          <button aria-label="Remove menu" className="header-remove-button" onClick={() => removeMenuItem(menuIndex)} type="button">
                            <i className="fa fa-times"></i>
                          </button>
                        </div>
                      </div>
                      <div className="header-menu-fields">
                        <input className="form-control" name={`menuItems.${menuIndex}.label`} onBlur={handleBlur} onChange={handleChange} placeholder="Menu label" value={item.label} />
                        <input className="form-control" name={`menuItems.${menuIndex}.link`} onBlur={handleBlur} onChange={handleChange} placeholder="/page-link" value={item.link} />
                        <input className="form-control" name={`menuItems.${menuIndex}.sortOrder`} onBlur={handleBlur} onChange={handleChange} placeholder="1" type="number" value={item.sortOrder} />
                      </div>

                      <div className="header-child-head">
                        <span>Child Links</span>
                        <button onClick={() => addChild(menuIndex)} type="button">
                          <i className="fa fa-plus"></i>
                          Add Child
                        </button>
                      </div>
                      <div className="header-child-list">
                        {(item.children || []).length ? (
                          (item.children || []).map((child, childIndex) => (
                            <div className="header-child-group" key={childIndex}>
                              <div className="header-child-row">
                                <input className="form-control" name={`menuItems.${menuIndex}.children.${childIndex}.label`} onBlur={handleBlur} onChange={handleChange} placeholder="Child label" value={child.label} />
                                <input className="form-control" name={`menuItems.${menuIndex}.children.${childIndex}.link`} onBlur={handleBlur} onChange={handleChange} placeholder="/child-link" value={child.link} />
                                <input className="form-control" name={`menuItems.${menuIndex}.children.${childIndex}.sortOrder`} onBlur={handleBlur} onChange={handleChange} placeholder="1" type="number" value={child.sortOrder} />
                                <label className="report-toggle">
                                  <input checked={child.status} name={`menuItems.${menuIndex}.children.${childIndex}.status`} onChange={(event) => setFieldValue(`menuItems.${menuIndex}.children.${childIndex}.status`, event.target.checked)} type="checkbox" />
                                  <span>Active</span>
                                </label>
                                <button aria-label="Remove child link" className="header-remove-button" onClick={() => removeChild(menuIndex, childIndex)} type="button">
                                  <i className="fa fa-times"></i>
                                </button>
                              </div>
                              <div className="header-subchild-panel">
                                <div className="header-child-head is-subchild">
                                  <span>Sub Child Links</span>
                                  <button onClick={() => addSubChild(menuIndex, childIndex)} type="button">
                                    <i className="fa fa-plus"></i>
                                    Add Sub Child
                                  </button>
                                </div>
                                {(child.children || []).length ? (
                                  (child.children || []).map((subChild, subChildIndex) => (
                                    <div className="header-child-row header-subchild-row" key={subChildIndex}>
                                      <input className="form-control" name={`menuItems.${menuIndex}.children.${childIndex}.children.${subChildIndex}.label`} onBlur={handleBlur} onChange={handleChange} placeholder="Sub child label" value={subChild.label} />
                                      <input className="form-control" name={`menuItems.${menuIndex}.children.${childIndex}.children.${subChildIndex}.link`} onBlur={handleBlur} onChange={handleChange} placeholder="/sub-child-link" value={subChild.link} />
                                      <input className="form-control" name={`menuItems.${menuIndex}.children.${childIndex}.children.${subChildIndex}.sortOrder`} onBlur={handleBlur} onChange={handleChange} placeholder="1" type="number" value={subChild.sortOrder} />
                                      <label className="report-toggle">
                                        <input checked={subChild.status} name={`menuItems.${menuIndex}.children.${childIndex}.children.${subChildIndex}.status`} onChange={(event) => setFieldValue(`menuItems.${menuIndex}.children.${childIndex}.children.${subChildIndex}.status`, event.target.checked)} type="checkbox" />
                                        <span>Active</span>
                                      </label>
                                      <button aria-label="Remove sub child link" className="header-remove-button" onClick={() => removeSubChild(menuIndex, childIndex, subChildIndex)} type="button">
                                        <i className="fa fa-times"></i>
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <p className="header-empty-children">No sub child links.</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="header-empty-children">No child links.</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <div className="about-page-sticky-actions">
              <div><strong>Header Management</strong><span>Save logo and menu links.</span></div>
              <SubmitButton loading={updating} text="Update Header" />
            </div>
          </main>
        </div>
      </form>

      <div className="modal fade" id="selectHeaderLogoModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="selectHeaderLogoModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 me-2" id="selectHeaderLogoModalLabel">Select Logo</h1>
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
                    <button className="about-page-media-card" data-bs-dismiss="modal" onClick={() => setFieldValue("logo", item.filename)} type="button">
                      {renderMediaThumb(item.filename)}
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
