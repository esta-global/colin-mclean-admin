import { GoBackButton } from "../../components";

import React, { useRef, useState } from "react";
import { removeFile } from "../../utills";
import { toast } from "react-toastify";
import { API_URL } from "../../constants";
import ReactHelmet from "../../components/ui/ReactHelmet";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";

export function AddMedia() {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMimeTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];

  async function uploadFiles(files: FileList | File[]) {
    const selectedFiles = Array.from(files);

    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    const validFiles = selectedFiles.filter((file) =>
      acceptedMimeTypes.includes(file.type)
    );

    if (validFiles.length === 0) {
      toast.error("Only JPG, PNG, WEBP images and MP4 videos are allowed.");
      return;
    }

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped because the format is not supported.");
    }

    validFiles.forEach((file) => formData.append("files", file));

    try {
      setIsUploading(true);
      let url = `${API_URL}/media`;
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
        let images = apiData?.body?.map((item: any) => {
          return item.filename;
        });

        setUploadedImages((old) => {
          return [...old, ...images];
        });
        toast.success(`${images.length} file uploaded successfully`);
      } else {
        toast.error(apiData?.message || "Failed to upload media");
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files) {
      return;
    }

    uploadFiles(files);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (isUploading) {
      return;
    }

    uploadFiles(event.dataTransfer.files);
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    index: number
  ) {
    event.preventDefault();
    try {
      const apiResponse = await removeFile(`/media`, fileName);

      if (apiResponse?.status == 200) {
        let images = [...uploadedImages];
        images.splice(index, 1);
        setUploadedImages(images);
        toast.success("Media removed successfully");
      } else {
        let images = [...uploadedImages];
        images.splice(index, 1);
        setUploadedImages(images);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  return (
    <div className="content-wrapper add-media-page">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="add-media-header">
            <div className="add-media-title">
              <GoBackButton />
              <ReactHelmet title="Add Media" />
              <div>
                <h4 className="font-weight-bold mb-1">Add Media</h4>
                <p className="mb-0">
                  Upload product images and videos to your media library.
                </p>
              </div>
            </div>
            <div className="add-media-status">
              <span>{uploadedImages.length} uploaded this session</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="col-md-12 p-0">
            <div className="card rounded-2 add-media-card">
              <div className="card-body">
                <div className="add-media-card-heading">
                  <div>
                    <span className="add-media-kicker">Media uploader</span>
                    <h5 className="mb-0">Product Media</h5>
                  </div>
                  <span className="add-media-chip">JPG, PNG, WEBP, MP4</span>
                </div>

                <div className="add-media-layout">
                  <label
                    htmlFor={"imagesFile"}
                    className={`add-media-dropzone ${
                      isDragging ? "is-dragging" : ""
                    } ${isUploading ? "is-uploading" : ""}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <span className="add-media-dropzone-icon">
                      <i className="fa fa-cloud-arrow-up"></i>
                    </span>
                    <strong>
                      {isUploading ? "Uploading media..." : "Drop files here"}
                    </strong>
                    <p className="mb-0">
                      Drag and drop files, or browse from your computer.
                    </p>
                    <span className="add-media-browse-btn">
                      <i className="fa fa-folder-open"></i>
                      Browse files
                    </span>
                  </label>

                  <aside className="add-media-help">
                    <div className="add-media-help-item">
                      <i className="fa fa-image"></i>
                      <div>
                        <strong>Images</strong>
                        <span>Use clear product photos in JPG, PNG, or WEBP.</span>
                      </div>
                    </div>
                    <div className="add-media-help-item">
                      <i className="fa fa-video"></i>
                      <div>
                        <strong>Videos</strong>
                        <span>MP4 videos are supported for product media.</span>
                      </div>
                    </div>
                    <div className="add-media-help-item">
                      <i className="fa fa-layer-group"></i>
                      <div>
                        <strong>Multiple upload</strong>
                        <span>Select multiple files at once to upload faster.</span>
                      </div>
                    </div>
                  </aside>
                </div>

                <input
                  type="file"
                  name="imagesFile"
                  id="imagesFile"
                  ref={fileInputRef}
                  onChange={(evt) => {
                    handleUploadFile(evt);
                  }}
                  accept=".jpg,.jpeg,.png,.webp,.mp4,image/jpeg,image/png,image/webp,video/mp4"
                  className="form-control"
                  multiple={true}
                  style={{ display: "none" }}
                  disabled={isUploading}
                />

                <div className="add-media-preview-section">
                  <div className="add-media-preview-heading">
                    <h6 className="mb-0">Uploaded media</h6>
                    <span>{uploadedImages.length} files</span>
                  </div>

                  {uploadedImages.length === 0 ? (
                    <div className="add-media-empty">
                      <i className="fa fa-images"></i>
                      <p className="mb-0">
                        Uploaded files will appear here for quick review.
                      </p>
                    </div>
                  ) : (
                    <div className="add-media-preview-grid">
                      {uploadedImages?.map((file: any, index: number) => {
                        const fileUrl = addUrlToFile(file);
                        const mediaType = getMediaType(fileUrl);

                        return (
                          <div className="add-media-preview-card" key={file}>
                            <button
                              type="button"
                              className="add-media-remove-btn"
                              aria-label={`Remove ${file}`}
                              title="Remove media"
                              onClick={(evt) => {
                                handleDeleteFile(evt, file, index);
                              }}
                            >
                              <i className="fa fa-trash"></i>
                            </button>

                            {mediaType == "image" ? (
                              <img src={fileUrl} alt={file} />
                            ) : mediaType == "video" ? (
                              <video controls>
                                <source src={fileUrl} type="video/mp4" />
                              </video>
                            ) : (
                              <div className="add-media-file-fallback">
                                <i className="fa fa-file"></i>
                              </div>
                            )}

                            <div className="add-media-file-name" title={file}>
                              {file}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
