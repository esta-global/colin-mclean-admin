import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../constants";
import { remove } from "../../utills";
import { addUrlToFile } from "../../utills/addUrlToFile";

export interface ImageUploadBoxProps {
  label: string;
  name?: string;
  value?: string;
  error?: string;
  touched?: boolean;
  onChange: (filename: string) => void;
  onBlur?: () => void;
  hint?: string;
  description?: string;
  minHeight?: number | string;
  disabled?: boolean;
}

export function ImageUploadBox({
  label,
  name,
  value = "",
  error,
  touched,
  onChange,
  onBlur,
  hint,
  description = "JPG, PNG, or WEBP image. Paste image also works.",
  minHeight = 240,
  disabled = false,
}: ImageUploadBoxProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = `image-upload-${name || label.toLowerCase().replace(/\s+/g, "-")}`;

  const allowedMimeTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
  ];

  async function uploadFile(file: File) {
    if (!allowedMimeTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const url = `${API_URL}/fileUploads`;
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const apiData = await res.json();
      if (apiData.status === 200 && apiData.body?.[0]?.filename) {
        const filename = apiData.body[0].filename;
        onChange(filename);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(apiData.message || "Failed to upload image.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload network error.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const clipboardFiles = e.clipboardData?.files;
    if (!clipboardFiles || clipboardFiles.length === 0) return;

    const file = Array.from(clipboardFiles).find((f) =>
      f.type.startsWith("image/"),
    );

    if (file) {
      e.preventDefault();
      void uploadFile(file);
    }
  }

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!value) return;

    if (
      !value.startsWith("http://") &&
      !value.startsWith("https://") &&
      !value.startsWith("/")
    ) {
      try {
        await remove(`/fileUploads/${value}`);
      } catch {
        // Silently continue
      }
    }

    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const heightStyle = minHeight ? { minHeight } : undefined;

  return (
    <div className="image-upload-box-wrapper mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="font-weight-bold mb-0 text-dark">
          {label}
        </label>
        {hint && <span className="badge badge-light border text-muted">{hint}</span>}
      </div>

      <div
        className={value ? "post-cover-grid has-cover-image" : "post-cover-grid"}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <label
          htmlFor={inputId}
          className={`post-cover-uploader ${disabled || isUploading ? "disabled" : ""}`}
          style={heightStyle}
        >
          <span className="post-cover-uploader__icon">
            {isUploading ? (
              <i className="fa fa-spinner fa-spin"></i>
            ) : (
              <i className="fa fa-cloud-arrow-up"></i>
            )}
          </span>
          <strong>{isUploading ? "Uploading image..." : `Upload ${label}`}</strong>
          <p>{description}</p>
          <span className="post-cover-uploader__button">
            {isUploading ? "Please wait..." : "Choose file"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            id={inputId}
            name={name}
            accept="image/png,image/jpg,image/jpeg,image/webp"
            onChange={handleFileChange}
            onBlur={onBlur}
            disabled={disabled || isUploading}
          />
        </label>

        <div className="post-cover-preview" style={heightStyle}>
          {value ? (
            <>
              <a
                href={addUrlToFile(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="post-cover-preview__image"
                title="Click to view full image"
              >
                <img src={addUrlToFile(value)} alt={label} />
              </a>
              <button
                type="button"
                className="post-cover-remove"
                aria-label="Remove image"
                onClick={handleDelete}
                disabled={disabled || isUploading}
                title="Remove image"
              >
                <i className="fa fa-trash"></i>
              </button>
            </>
          ) : (
            <div className="post-cover-empty" style={heightStyle}>
              <i className="fa fa-image"></i>
              <span>No image selected</span>
            </div>
          )}

          {touched && error ? (
            <p className="custom-form-error text-danger p-2 mb-0">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
