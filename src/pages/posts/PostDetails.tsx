import { GoBackButton, OverlayLoading } from "../../components";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { get } from "../../utills";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import DOMPurify from "dompurify";
import { addUrlToFile } from "../../utills/addUrlToFile";
import { ContentType } from "../../validationSchemas/postSchema";

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="post-detail-info-row">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

const detailLabels: Record<ContentType, { singular: string; editPath: string; description: string }> = {
  blog: {
    singular: "Blog",
    editPath: "/posts/edit",
    description: "Review the public preview, publishing details, and SEO metadata.",
  },
  essay: {
    singular: "Essay",
    editPath: "/essays/edit",
    description: "Review the essay preview, publishing details, and SEO metadata.",
  },
};

export function PostDetails({ defaultType = "blog" }: { defaultType?: ContentType }) {
  const { id } = useParams();
  const labels = detailLabels[defaultType];
  const [loading, setLoading] = useState<boolean>(true);
  const [blogDetails, setBlogDetails] = useState<any>({});

  useEffect(
    function () {
      async function getData(blogId: string) {
        setLoading(true);
        const apiResponse = await get(`/blogs/${blogId}`, true);
        if (apiResponse?.status == 200) {
          setBlogDetails(apiResponse?.body);
        }
        setLoading(false);
      }

      if (id) getData(id);
    },
    [id],
  );

  const coverImage = useMemo(() => {
    return blogDetails?.coverImage ? addUrlToFile(blogDetails.coverImage) : "";
  }, [blogDetails?.coverImage]);

  const contentHtml = useMemo(() => {
    return DOMPurify.sanitize(blogDetails?.content || "");
  }, [blogDetails?.content]);

  const excerptHtml = useMemo(() => {
    return DOMPurify.sanitize(blogDetails?.excerpt || "");
  }, [blogDetails?.excerpt]);

  return (
    <div className="content-wrapper post-detail-page">
      <div className="post-detail-header">
        <div>
          <div className="post-detail-header__actions">
            <GoBackButton />
            <span className="post-page-eyebrow">Content</span>
          </div>
          <h1>{labels.singular} Details</h1>
          <p>{labels.description}</p>
        </div>
        <Link to={`${labels.editPath}/${id}`} className="btn btn-primary post-primary-action">
          Edit {labels.singular}
        </Link>
      </div>

      {loading ? (
        <OverlayLoading />
      ) : (
        <div className="post-detail-layout">
          <main className="post-detail-main">
            <article className="post-detail-card post-detail-article">
              {coverImage ? (
                <div className="post-detail-cover">
                  <img
                    src={coverImage}
                    alt={blogDetails?.title || "Blog cover"}
                  />
                </div>
              ) : (
                <div className="post-detail-cover-empty">
                  <i className="fa fa-image"></i>
                  <span>No cover image</span>
                </div>
              )}

              <div className="post-detail-article-body">
                <div className="post-detail-badges">
                  <span
                    className={`post-detail-status ${
                      blogDetails?.status ? "is-active" : "is-draft"
                    }`}
                  >
                    {blogDetails?.status ? "Published" : "Draft"}
                  </span>
                  {blogDetails?.category?.name ? (
                    <span className="post-detail-chip">
                      {blogDetails.category.name}
                    </span>
                  ) : null}
                </div>

                <h2>{blogDetails?.title || "Untitled post"}</h2>

                <div className="post-detail-byline">
                  <span>
                    By <strong>{blogDetails?.author?.name || "Colin McLean"}</strong>
                  </span>
                  <span className="post-detail-dot"></span>
                  <span>
                    {blogDetails?.createdAt
                      ? moment(blogDetails.createdAt).format("MMM DD, YYYY")
                      : "-"}
                  </span>
                </div>

                {blogDetails?.tags ? (
                  <div className="post-detail-tags">
                    {String(blogDetails.tags)
                      .split(",")
                      .map((tag: string) => tag.trim())
                      .filter(Boolean)
                      .map((tag: string) => (
                        <span key={tag} className="post-detail-tag">
                          {tag}
                        </span>
                      ))}
                  </div>
                ) : null}

                <div
                  className="post-detail-excerpt"
                  dangerouslySetInnerHTML={{
                    __html: excerptHtml || "<p></p>",
                  }}
                />

                <div
                  className="post-detail-content"
                  dangerouslySetInnerHTML={{
                    __html: contentHtml || "<p></p>",
                  }}
                />
              </div>
            </article>
          </main>

          <aside className="post-detail-side">
            <section className="post-detail-card">
              <div className="post-detail-section-heading">
                <span>Overview</span>
                <h2>Quick info</h2>
              </div>
              <InfoRow label="Slug" value={blogDetails?.slug} />
              {blogDetails?.author?.name ? (
                <InfoRow label="Author" value={blogDetails?.author?.name} />
              ) : null}
              <InfoRow label="Category" value={blogDetails?.category?.name} />
              <InfoRow
                label="Created"
                value={
                  blogDetails?.createdAt
                    ? moment(blogDetails.createdAt).format("DD MMM YYYY")
                    : "-"
                }
              />
              <InfoRow
                label="Updated"
                value={
                  blogDetails?.updatedAt
                    ? moment(blogDetails.updatedAt).format("DD MMM YYYY")
                    : "-"
                }
              />
            </section>

            <section className="post-detail-card">
              <div className="post-detail-section-heading">
                <span>SEO</span>
                <h2>Meta details</h2>
              </div>
              <InfoRow label="Meta Title" value={blogDetails?.metaTitle} />
              <InfoRow
                label="Meta Description"
                value={blogDetails?.metaDescription}
              />
              <InfoRow label="Meta Keywords" value={blogDetails?.metaKeywords} />
            </section>

            <section className="post-detail-card">
              <div className="post-detail-section-heading">
                <span>Summary</span>
                <h2>Post excerpt</h2>
              </div>
              <div
                className="post-detail-summary"
                dangerouslySetInnerHTML={{
                  __html: excerptHtml || blogDetails?.title || "-",
                }}
              />
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
