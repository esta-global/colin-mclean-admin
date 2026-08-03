import { GoBackButton, Pagination } from "../../components";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteConfirmation, get, removeFile } from "../../utills";
import { toast } from "react-toastify";
import { addUrlToFile, getMediaType } from "../../utills/addUrlToFile";

export function MediaList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<boolean | string>("");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{
    filename: string;
    type: "image" | "video" | "unknown";
    url: string;
  } | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 36,
    totalRecords: 0,
    totalPages: 0,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/media?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&status=${status}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
          setPagination({
            ...pagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          });
        } else {
          setRecords([]);
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      }

      getData();
    },
    [pagination.page, pagination.limit, searchQuery, needReload, status]
  );

  // listening for shortcut
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if the Shift key and "A" key are pressed
      if (event.altKey && event.key === "=") {
        navigate("/finishes/add");
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (!selectedMedia) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedMedia(null);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMedia]);

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    filename: string
  ) {
    event.preventDefault();
    event.stopPropagation();

    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    try {
      const apiResponse = await removeFile(`/media`, filename);

      if (apiResponse?.status === 200) {
        toast.success("Image deleted successfully");
      } else {
        toast.error(apiResponse?.message || "Failed to delete image");
      }
      setNeedReload(!needReload);
    } catch (error: any) {
      toast.error(error?.message || "An error occurred during deletion");
    }
  }

  function handleViewMedia(filename: string) {
    const mediaUrl = addUrlToFile(filename);
    const mediaType = getMediaType(mediaUrl);

    setSelectedMedia({
      filename,
      type: mediaType,
      url: mediaUrl,
    });
  }

  const startRecord =
    pagination.totalRecords === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(
    pagination.page * pagination.limit,
    pagination.totalRecords
  );

  return (
    <div className="content-wrapper media-library-page">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="media-library-header">
            <div className="media-library-title">
              <GoBackButton />
              <div>
                <h4 className="font-weight-bold mb-1">Media List</h4>
                <p className="mb-0">
                  {pagination.totalRecords > 0
                    ? `Showing ${startRecord}-${endRecord} of ${pagination.totalRecords} media files`
                    : "Manage uploaded images and videos"}
                </p>
              </div>
            </div>
            <Link
              title="Alt + '+'"
              to={"/media/add"}
              type="button"
              className="btn btn-primary text-light media-add-btn"
            >
              <i className="fa fa-plus"></i>
              <span>Add Media</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card rounded-2 media-library-card">
            <div className="card-body shadow-none">
              <div className="media-library-toolbar">
                <div className="media-search-box">
                  <i className="fa fa-search"></i>
                  <input
                    placeholder="Search media..."
                    className="form-control"
                    type="search"
                    value={searchQuery}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                      setSearchQuery(evt.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
                <div className="media-library-meta">
                  <span>{pagination.limit} per page</span>
                </div>
              </div>

              {loading ? (
                <div className="media-library-state">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mb-0">Loading media...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="media-library-state media-library-empty">
                  <i className="fa fa-images"></i>
                  <h5>No media found</h5>
                  <p className="mb-0">
                    Try another search or upload a new media file.
                  </p>
                </div>
              ) : (
                <div className="media-list-section media-library-grid">
                  {records?.map((item) => {
                    const mediaUrl = addUrlToFile(item.filename);
                    const mediaType = getMediaType(mediaUrl);

                    return (
                      <div className="media-library-item" key={item.filename}>
                        <div
                          className="card media-library-thumb"
                          role="button"
                          tabIndex={0}
                          title="Click to view media"
                          onClick={() => handleViewMedia(item.filename)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleViewMedia(item.filename);
                            }
                          }}
                        >
                          <button
                            className="media-close-btn"
                            aria-label={`Delete ${item.filename}`}
                            title="Delete media"
                            type="button"
                            onClick={(evt) => {
                              handleDeleteFile(evt, item.filename);
                            }}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                          {mediaType == "image" ? (
                            <img src={mediaUrl} alt={item.filename} />
                          ) : mediaType == "video" ? (
                            <video controls onClick={(event) => event.stopPropagation()}>
                              <source src={mediaUrl} type="video/mp4" />
                            </video>
                          ) : (
                            <div className="media-library-file">
                              <i className="fa fa-file"></i>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          {/* Data Table */}
          {/* <DataTable
                          getTableBodyProps={getTableProps}
                          getTableProps={getTableProps}
                          headerGroups={headerGroups}
                          rows={rows}
                          prepareRow={prepareRow}
                        /> */}
          {/* Pagination */}
          <Pagination
            pagination={pagination}
            setPagination={setPagination}
            tableName={"table-to-xls"}
            csvFileName={"images"}
          />
        </div>
      </div>

      {selectedMedia ? (
        <div
          className="media-viewer-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
        >
          <button
            type="button"
            className="media-viewer-backdrop"
            onClick={() => setSelectedMedia(null)}
            aria-label="Close media preview"
          />
          <div className="media-viewer-panel">
            <div className="media-viewer-header">
              <div>
                <span>Media Preview</span>
                <strong title={selectedMedia.filename}>
                  {selectedMedia.filename}
                </strong>
              </div>
              <div className="media-viewer-actions">
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open media in new tab"
                >
                  <i className="fa fa-up-right-from-square"></i>
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedMedia(null)}
                  aria-label="Close media preview"
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            </div>

            <div className="media-viewer-body">
              {selectedMedia.type === "image" ? (
                <img src={selectedMedia.url} alt={selectedMedia.filename} />
              ) : selectedMedia.type === "video" ? (
                <video controls autoPlay>
                  <source src={selectedMedia.url} type="video/mp4" />
                </video>
              ) : (
                <div className="media-viewer-file">
                  <i className="fa fa-file"></i>
                  <strong>{selectedMedia.filename}</strong>
                  <p>This file type can be opened in a new tab.</p>
                  <a href={selectedMedia.url} target="_blank" rel="noreferrer">
                    Open file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
