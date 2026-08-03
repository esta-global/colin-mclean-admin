import { GoBackButton, OverlayLoading } from "../../components";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Link, useParams } from "react-router-dom";
import { get } from "../../utills";
import ReactHelmet from "../../components/ui/ReactHelmet";
import { addUrlToFile } from "../../utills/addUrlToFile";

type ListingImage =
  | string
  | {
      url?: string;
      image?: string;
      filename?: string;
      name?: string;
    };

type ProductIdentification = {
  detected_product?: string;
  category?: string;
  subcategory?: string;
  product_type?: string;
  confidence_score?: unknown;
  brand?: string;
};

type MarketplaceVariant = {
  marketplace?: string;
  category_path?: string;
  confidence_score?: unknown;
  title?: string;
  description?: string;
  condition?: string;
};

type ListingDetailRecord = {
  _id?: string;
  images?: ListingImage[];
  image?: string;
  title?: string;
  product_name?: string;
  product_identification?: ProductIdentification;
  marketplaces?: MarketplaceVariant[];
  item_specifics?: Record<string, unknown>;
  category?: string;
  subcategory?: string;
  product_type?: string;
  confidence_score?: unknown;
  marketplace?: string;
  condition?: string;
  brand?: string;
  status?: boolean;
  createdAt?: string;
  description?: string;
  features?: string[];
  keywords?: string[];
  price?: unknown;
};

export function ListingDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [listingDetails, setListingDetails] = useState<ListingDetailRecord>({});
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [imageViewerOpen, setImageViewerOpen] = useState<boolean>(false);

  useEffect(
    function () {
      async function getData(recordId: string) {
        setLoading(true);
        const apiResponse = await get(`/listings/${recordId}`, true);
        if (apiResponse?.status == 200) {
          setListingDetails(apiResponse?.body);
          setFailedImages([]);
        }
        setLoading(false);
      }

      if (id) getData(id);
    },
    [id],
  );

  const productIdentification = listingDetails?.product_identification || {};
  const marketplaces = listingDetails?.marketplaces || [];
  const itemSpecifics = useMemo(
    () => listingDetails?.item_specifics || {},
    [listingDetails?.item_specifics],
  );

  const itemSpecificsEntries = useMemo(
    () =>
      Object.entries(itemSpecifics).filter(([, value]) => {
        return value !== undefined && value !== null && String(value) !== "";
      }),
    [itemSpecifics],
  );

  const title =
    listingDetails?.title ||
    listingDetails?.product_name ||
    productIdentification?.detected_product ||
    "Listing";

  const categoryPath = [
    listingDetails?.category || productIdentification?.category,
    listingDetails?.subcategory || productIdentification?.subcategory,
    listingDetails?.product_type || productIdentification?.product_type,
  ].filter(Boolean);

  const confidenceScore =
    productIdentification?.confidence_score ??
    listingDetails?.confidence_score ??
    marketplaces?.[0]?.confidence_score ??
    0;

  const marketplaceName =
    listingDetails?.marketplace || marketplaces?.[0]?.marketplace || "-";

  const condition =
    listingDetails?.condition || marketplaces?.[0]?.condition || "-";

  const brand =
    listingDetails?.brand ||
    productIdentification?.brand ||
    itemSpecifics?.Brand ||
    itemSpecifics?.brand ||
    itemSpecifics?.["Visible Branding"] ||
    "-";

  function formatLabel(value: string) {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatConfidence(value: unknown) {
    if (value === undefined || value === null || value === "") return "0%";
    return `${Number(value) || value}%`;
  }

  function getImageUrl(image: string) {
    if (!image) return "";
    if (/^https?:\/\//i.test(image)) return image;
    return addUrlToFile(image);
  }

  function getImageValue(image: ListingImage) {
    if (typeof image === "string") return image;
    return image?.url || image?.image || image?.filename || image?.name || "";
  }

  function formatPrice(value: any) {
    if (value === "" || value === null || value === undefined) return "-";
    const price = Number(value);
    if (Number.isNaN(price)) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  function renderEmpty(message: string) {
    return <p className="listing-detail-empty mb-0">{message}</p>;
  }

  const listingImages = useMemo(() => {
    const imageValues = Array.isArray(listingDetails?.images)
      ? listingDetails.images.map(getImageValue)
      : [];

    if (listingDetails?.image) imageValues.push(listingDetails.image);

    return Array.from(
      new Set(
        imageValues
          .map((image) => getImageUrl(image))
          .filter((image) => image && !failedImages.includes(image)),
      ),
    );
  }, [failedImages, listingDetails]);

  const resolvedImageIndex = listingImages.length
    ? Math.min(activeImageIndex, listingImages.length - 1)
    : 0;
  const activeImage = listingImages[resolvedImageIndex] || "";
  const hasMultipleImages = listingImages.length > 1;

  const showPreviousImage = useCallback(() => {
    setActiveImageIndex((current) =>
      current === 0 ? listingImages.length - 1 : current - 1,
    );
  }, [listingImages.length]);

  const showNextImage = useCallback(() => {
    setActiveImageIndex((current) => (current + 1) % listingImages.length);
  }, [listingImages.length]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [listingDetails?._id]);

  useEffect(() => {
    if (!imageViewerOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setImageViewerOpen(false);
      if (event.key === "ArrowLeft" && hasMultipleImages) showPreviousImage();
      if (event.key === "ArrowRight" && hasMultipleImages) showNextImage();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    hasMultipleImages,
    imageViewerOpen,
    listingImages.length,
    showNextImage,
    showPreviousImage,
  ]);

  return (
    <div className="content-wrapper listing-detail-page">
      <ReactHelmet title="Listing Details" />

      {loading ? (
        <OverlayLoading />
      ) : (
        <>
          <div className="listing-detail-hero">
            <div>
              <div className="listing-detail-actions">
                <GoBackButton />
                <Link to="/listings" className="listing-detail-back-link">
                  Back to Listings
                </Link>
              </div>
              <h1>{title}</h1>
              <p>{categoryPath.length ? categoryPath.join(" > ") : "-"}</p>
            </div>
            <span
              className={`listing-detail-status ${
                listingDetails?.status ? "is-active" : "is-draft"
              }`}
            >
              {listingDetails?.status ? "Active" : "Draft"}
            </span>
          </div>

          <div className="listing-detail-top-grid">
            <section className="listing-detail-card listing-detail-overview">
              <div className="listing-detail-image-panel">
                {activeImage ? (
                  <div className="listing-detail-image-viewer">
                    <button
                      type="button"
                      className="listing-detail-main-image"
                      onClick={() => setImageViewerOpen(true)}
                      title="View product image"
                    >
                      <img
                        src={activeImage}
                        alt={title}
                        onError={() =>
                          setFailedImages((oldImages) => [
                            ...oldImages,
                            activeImage,
                          ])
                        }
                      />
                      <span>View</span>
                    </button>

                    {hasMultipleImages ? (
                      <div className="listing-detail-thumbnails">
                        {listingImages.map((image, index) => (
                          <button
                            type="button"
                            className={`listing-detail-thumbnail ${
                              index === resolvedImageIndex ? "is-active" : ""
                            }`}
                            key={image}
                            onClick={() => setActiveImageIndex(index)}
                            title={`Show image ${index + 1}`}
                          >
                            <img
                              src={image}
                              alt={`${title} thumbnail ${index + 1}`}
                              onError={() =>
                                setFailedImages((oldImages) => [
                                  ...oldImages,
                                  image,
                                ])
                              }
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="listing-detail-image-placeholder">
                    Image not available
                  </div>
                )}
              </div>

              <div className="listing-detail-summary">
                <div className="listing-detail-stat">
                  <span>Marketplace</span>
                  <strong>{marketplaceName}</strong>
                </div>
                <div className="listing-detail-stat">
                  <span>Created</span>
                  <strong>
                    {listingDetails?.createdAt
                      ? moment(listingDetails.createdAt).format("D/M/YYYY")
                      : "-"}
                  </strong>
                </div>
                <div className="listing-detail-stat">
                  <span>Condition</span>
                  <strong>{condition}</strong>
                </div>
                <div className="listing-detail-stat">
                  <span>Price</span>
                  <strong>{formatPrice(listingDetails?.price)}</strong>
                </div>
                <div className="listing-detail-stat">
                  <span>Confidence</span>
                  <strong>{formatConfidence(confidenceScore)}</strong>
                </div>

                <div className="listing-detail-description">
                  <h2>Description</h2>
                  <p>{listingDetails?.description || "-"}</p>
                </div>
              </div>
            </section>

            <aside className="listing-detail-card listing-detail-identity">
              <h2>Product Identity</h2>
              <div className="listing-detail-identity-item">
                <span>Product</span>
                <strong>
                  {productIdentification?.detected_product ||
                    listingDetails?.product_name ||
                    title}
                </strong>
              </div>
              <div className="listing-detail-identity-item">
                <span>Brand</span>
                <strong>{brand}</strong>
              </div>
              <div className="listing-detail-identity-item">
                <span>Type</span>
                <strong>
                  {productIdentification?.product_type ||
                    listingDetails?.product_type ||
                    "-"}
                </strong>
              </div>
            </aside>
          </div>

          <section className="listing-detail-card listing-detail-section">
            <div className="listing-detail-section-heading">
              <h2>Features</h2>
              <p>{(listingDetails?.features || []).length} product highlights</p>
            </div>
            {(listingDetails?.features || []).length ? (
              <div className="listing-detail-feature-grid">
                {listingDetails.features.map((item: string) => (
                  <div className="listing-detail-feature" key={item}>
                    <span></span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            ) : (
              renderEmpty("No features available.")
            )}
          </section>

          <section className="listing-detail-card listing-detail-section">
            <div className="listing-detail-section-heading">
              <h2>Keywords</h2>
              <p>Comma-separated search terms</p>
            </div>
            {(listingDetails?.keywords || []).length ? (
              <div className="listing-detail-chip-list">
                {listingDetails.keywords.map((item: string) => (
                  <span className="listing-detail-chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              renderEmpty("No keywords available.")
            )}
          </section>

          <section className="listing-detail-card listing-detail-section">
            <div className="listing-detail-section-heading">
              <h2>Item Specifics</h2>
              <p>{itemSpecificsEntries.length} structured details</p>
            </div>
            {itemSpecificsEntries.length ? (
              <div className="listing-detail-specifics-grid">
                {itemSpecificsEntries.map(([key, value]) => (
                  <div className="listing-detail-specific" key={key}>
                    <span>{formatLabel(key)}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              renderEmpty("No item specifics available.")
            )}
          </section>

          {marketplaces.length ? (
            <section className="listing-detail-card listing-detail-section">
              <div className="listing-detail-section-heading">
                <h2>Marketplace Variants</h2>
                <p>{marketplaces.length} channel versions</p>
              </div>
              <div className="listing-detail-variant-grid">
                {marketplaces.map((marketplace, index: number) => (
                  <div
                    className="listing-detail-variant"
                    key={`${marketplace.marketplace}-${index}`}
                  >
                    <div className="listing-detail-variant-head">
                      <div>
                        <strong>{marketplace.marketplace || "Marketplace"}</strong>
                        <span>{marketplace.category_path || "-"}</span>
                      </div>
                      <em>{formatConfidence(marketplace.confidence_score)}</em>
                    </div>
                    <p>
                      <b>Title:</b> {marketplace.title || "-"}
                    </p>
                    <p>
                      <b>Description:</b> {marketplace.description || "-"}
                    </p>
                    <p>
                      <b>Condition:</b> {marketplace.condition || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {imageViewerOpen && activeImage ? (
            <div className="listing-detail-modal" role="dialog" aria-modal="true">
              <button
                type="button"
                className="listing-detail-modal__backdrop"
                onClick={() => setImageViewerOpen(false)}
                aria-label="Close image viewer"
              />
              <div className="listing-detail-modal__content">
                <div className="listing-detail-modal__header">
                  <strong>{title}</strong>
                  <button
                    type="button"
                    onClick={() => setImageViewerOpen(false)}
                    aria-label="Close image viewer"
                  >
                    x
                  </button>
                </div>
                <div className="listing-detail-modal__stage">
                  {hasMultipleImages ? (
                    <button
                      type="button"
                      className="listing-detail-modal__arrow is-left"
                      onClick={showPreviousImage}
                      aria-label="Previous image"
                    >
                      &lt;
                    </button>
                  ) : null}
                  <img src={activeImage} alt={title} />
                  {hasMultipleImages ? (
                    <button
                      type="button"
                      className="listing-detail-modal__arrow is-right"
                      onClick={showNextImage}
                      aria-label="Next image"
                    >
                      &gt;
                    </button>
                  ) : null}
                </div>
                {hasMultipleImages ? (
                  <div className="listing-detail-modal__thumbs">
                    {listingImages.map((image, index) => (
                      <button
                        type="button"
                        className={`listing-detail-modal__thumb ${
                          index === resolvedImageIndex ? "is-active" : ""
                        }`}
                        key={`modal-${image}`}
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img src={image} alt={`${title} thumbnail ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
