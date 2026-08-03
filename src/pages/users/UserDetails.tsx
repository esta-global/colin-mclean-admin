import { GoBackButton, OverlayLoading, Pagination } from "../../components";

import { useEffect, useState } from "react";
import { get } from "../../utills";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function UserDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [listingsLoading, setListingsLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<any>({});
  const [listingDashboard, setListingDashboard] = useState<any>({});
  const [usersListings, setUsersListings] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  // get users
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const apiResponse = await get(`/users/${id}`, true);
        if (apiResponse?.status == 200) {
          setUserDetails(apiResponse?.body);
        }
        setLoading(false);
      }
      if (id) getData(id);
    },
    [id],
  );

  // get user listing dashboard
  useEffect(
    function () {
      async function getData(userId: string) {
        setDashboardLoading(true);
        const apiResponse = await get(
          `/listings/users/${userId}/dashboard?topLimit=5&recentLimit=5&categoryLimit=5&marketplaceLimit=5`,
          true,
        );

        if (apiResponse?.status == 200) {
          setListingDashboard(apiResponse?.body || {});
        } else {
          setListingDashboard({});
        }

        setDashboardLoading(false);
      }

      if (id) getData(id);
    },
    [id],
  );

  function getSocialUsername(link: string): string {
    // Remove any trailing slashes
    link = link.replace(/\/$/, "");

    // Extract the username after the last slash
    const parts = link.split("/");
    const username = parts[parts.length - 1];
    if (username[0] == "@") {
      return username;
    } else {
      return `@${username}`;
    }
  }

  function formatNumber(value: any): string {
    return Number(value || 0).toLocaleString("en-IN");
  }

  function formatPercentage(value: any): string {
    const numberValue = Number(value || 0);
    const sign = numberValue > 0 ? "+" : "";
    return `${sign}${numberValue.toFixed(1)}%`;
  }

  function formatPrice(value: any): string {
    if (value === "" || value === null || value === undefined) return "-";
    const price = Number(value);
    if (Number.isNaN(price)) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  function getPrimaryListingImage(listing: any): string {
    if (Array.isArray(listing?.images) && listing.images.length) {
      return listing.images[0];
    }

    return listing?.image || "";
  }

  const dashboardSummary = listingDashboard?.summary || {};
  const recentListings = listingDashboard?.recentListings || [];
  const categoryBreakdown = listingDashboard?.categoryBreakdown || [];
  const marketplaceBreakdown = listingDashboard?.marketplaceBreakdown || [];
  const statusBreakdown = listingDashboard?.statusBreakdown || [];
  const userInitial = userDetails?.name?.charAt(0)?.toUpperCase() || "U";
  const userStatusText = userDetails?.status ? "Active" : "Disabled";

  // get user listings
  useEffect(
    function () {
      async function getData(id: string) {
        setListingsLoading(true);
        const apiResponse = await get(
          `/listings?user=${id}&page=${pagination.page}&limit=${pagination.limit}`,
          true,
        );
        if (apiResponse?.status == 200) {
          setUsersListings(apiResponse?.body);
          setPagination({
            ...pagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          });
        } else {
          setUsersListings([]);
        }
        setListingsLoading(false);
      }
      if (id) getData(id);
    },
    [id, pagination.page, pagination.limit],
  );

  return (
    <div className="content-wrapper user-details-page">
      <div className="user-details-hero">
        <div className="user-details-hero__main">
          <div className="user-details-hero__actions">
            <GoBackButton />
            <span>User profile</span>
          </div>
          <h1>User Details</h1>
          <p>
            Review customer identity, contact information, listing performance,
            and marketplace activity in one place.
          </p>
        </div>
        {!loading ? (
          <div className="user-details-hero__meta">
            <span
              className={`user-status-badge ${
                userDetails?.status ? "active" : "disabled"
              }`}
            >
              {userStatusText}
            </span>
            <span>{formatNumber(dashboardSummary?.totalListings)} Listings</span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <OverlayLoading />
      ) : (
        <div className="user-details-dashboard">
          <section className="user-dashboard-welcome">
            <div>
              <span>Customer overview</span>
              <h2>{userDetails?.name || "User"}</h2>
              <p>
                Track this user's IFMA profile, listing activity, and
                marketplace performance.
              </p>
            </div>
            <div className="user-dashboard-welcome__profile">
              <span className="user-avatar">{userInitial}</span>
              <div>
                <strong>{userDetails?.name || "User"}</strong>
                <small>{userDetails?.email || "-"}</small>
              </div>
            </div>
          </section>

          {dashboardLoading ? (
            <div className="py-4 text-center text-muted">
              Loading dashboard...
            </div>
          ) : (
            <section className="user-dashboard-stats">
              <div className="user-dashboard-stat-card">
                <span>Total Listings</span>
                <strong>{formatNumber(dashboardSummary?.totalListings)}</strong>
                <small>
                  {formatNumber(dashboardSummary?.totalListings)} total
                </small>
              </div>
              <div className="user-dashboard-stat-card">
                <span>Active Listings</span>
                <strong>{formatNumber(dashboardSummary?.activeListings)}</strong>
                <small>Currently active</small>
              </div>
              <div className="user-dashboard-stat-card">
                <span>Inactive Listings</span>
                <strong>
                  {formatNumber(dashboardSummary?.inactiveListings)}
                </strong>
                <small>Needs attention</small>
              </div>
              <div className="user-dashboard-stat-card">
                <span>Growth</span>
                <strong>
                  {formatPercentage(dashboardSummary?.growthPercentage)}
                </strong>
                <small>vs last month</small>
              </div>
            </section>
          )}

          {/* User's Listing */}
          <div className="col-md-12">
            <div className="card user-panel user-orders-card mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 user-listing-table-head">
                    <div>
                      <span>Inventory</span>
                      <h2
                        className="mb-0 cursor-hand"
                        data-bs-toggle="collapse"
                        data-bs-target="#usersListings"
                        aria-expanded="false"
                        aria-controls="usersListings"
                      >
                        User's Listing
                      </h2>
                    </div>
                    <button
                      className="btn user-collapse-btn"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#usersListings"
                      aria-expanded="false"
                      aria-controls="usersListings"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse show mt-3" id="usersListings">
                    <div className="user-listing-table-shell">
                      {listingsLoading ? (
                        <div className="py-4 text-center text-muted">
                          Loading listings...
                        </div>
                      ) : usersListings?.length ? (
                        <>
                          <div className="user-listing-table">
                            {usersListings?.map((listing: any) => {
                              return (
                                <article
                                  className="user-listing-row"
                                  key={listing?._id}
                                >
                                  <div className="user-listing-row__media">
                                    <img
                                      src={addUrlToFile(
                                        getPrimaryListingImage(listing),
                                      )}
                                      alt={listing?.title}
                                      onError={(event) => {
                                        event.currentTarget.src =
                                          "/images/select-photo.png";
                                      }}
                                    />
                                  </div>

                                  <div className="user-listing-row__body">
                                    <div className="user-listing-row__title">
                                      <h3 title={listing?.title}>
                                        {listing?.title || "Untitled listing"}
                                      </h3>
                                      <span
                                        className={`user-status-badge ${
                                          listing?.status
                                            ? "active"
                                            : "disabled"
                                        }`}
                                      >
                                        {listing?.status
                                          ? "Active"
                                          : "Disabled"}
                                      </span>
                                    </div>

                                    <div className="user-listing-row__meta">
                                      <span>
                                        Marketplace{" "}
                                        <strong>
                                          {listing?.marketplace || "-"}
                                        </strong>
                                      </span>
                                      <span>
                                        Price{" "}
                                        <strong>
                                          {formatPrice(listing?.price)}
                                        </strong>
                                      </span>
                                      <span>
                                        Created{" "}
                                        <strong>
                                          {moment(listing?.createdAt).format(
                                            "DD-MMM-YYYY",
                                          )}
                                        </strong>
                                      </span>
                                    </div>
                                  </div>

                                  <Link
                                    className="user-listing-row__action"
                                    title="View Listing"
                                    to={{
                                      pathname: `/listings/details/${listing._id}`,
                                    }}
                                  >
                                    <span
                                      className="fas fa-eye"
                                      aria-hidden="true"
                                    ></span>
                                  </Link>
                                </article>
                              );
                            })}
                          </div>

                          <Pagination
                            pagination={pagination}
                            setPagination={setPagination}
                            tableName="user-listings-table"
                            csvFileName="user-listings"
                          />
                        </>
                      ) : (
                        <div className="alert alert-warning border-0 mb-0">
                          No listings found for this user.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="user-dashboard-side">
            <section className="user-dashboard-side-card">
              <h2>Top Listings</h2>
              <p>Highest-performing saved listings from this user.</p>
              <div className="user-dashboard-top-list">
                {(recentListings.length ? recentListings : usersListings)
                  .slice(0, 3)
                  .map((listing: any) => (
                    <Link
                      to={{ pathname: `/listings/details/${listing?._id}` }}
                      className="user-dashboard-top-item"
                      key={listing?._id}
                    >
                      <img
                        src={addUrlToFile(getPrimaryListingImage(listing))}
                        alt={listing?.title}
                        onError={(event) => {
                          event.currentTarget.src = "/images/select-photo.png";
                        }}
                      />
                      <div>
                        <strong title={listing?.title}>
                          {listing?.title || "Untitled listing"}
                        </strong>
                        <span>
                          {listing?.marketplace || "-"}
                          {listing?.category ? ` - ${listing.category}` : ""}
                        </span>
                        <em>
                          {listing?.confidence_score ?? 100}% confidence
                        </em>
                      </div>
                    </Link>
                  ))}
                {!recentListings.length && !usersListings.length ? (
                  <div className="user-listing-empty">No top listings yet.</div>
                ) : null}
              </div>
            </section>

            <section className="user-dashboard-side-card">
              <h2>Personal Details</h2>
              <div className="user-dashboard-detail-list">
                <div>
                  <span>Name</span>
                  <strong>{userDetails?.name || "-"}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{userDetails?.email || "-"}</strong>
                </div>
                <div>
                  <span>Mobile</span>
                  <strong>{userDetails?.mobile || "-"}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{userStatusText}</strong>
                </div>
              </div>
              <div className="user-profile-card__actions">
                <Link
                  to={`tel:${userDetails?.mobile}`}
                  className="btn user-contact-btn phone"
                  title="Call user"
                >
                  <i className="fa fa-phone"></i>
                  <span>Call</span>
                </Link>
                <Link
                  to={`mailto:${userDetails?.email}`}
                  className="btn user-contact-btn email"
                  title="Email user"
                >
                  <i className="fa fa-envelope"></i>
                  <span>Email</span>
                </Link>
              </div>
            </section>
          </aside>

          {/* KYC Documents */}
          {/* <div className="col-md-12">
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-2 cursor-hand"
                      data-bs-toggle="collapse"
                      data-bs-target="#trainerKycDocuments"
                      aria-expanded="false"
                      aria-controls="trainerKycDocuments"
                    >
                      KYC Documents{" "}
                    </h5>
                    <button
                      className="btn btn-light"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#trainerKycDocuments"
                      aria-expanded="false"
                      aria-controls="trainerKycDocuments"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse mt-2" id="trainerKycDocuments">
                    <div className="card card-body shadow-none p-2">
                      <table className="table table-sm">
                        <tbody>
                          {userDetails?.kycDocuments?.map((doc: any) => {
                            return (
                              <tr>
                                <td scope="row">{doc?.title}</td>
                                <td>
                                  <iframe
                                    src={doc?.documentFile}
                                    width="500"
                                    height="250"
                                    frameBorder="0"
                                  >
                                    Your browser does not support iframes.
                                  </iframe>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Trainer Certificates */}
          {/* <div className="col-md-12">
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h5
                      className="mb-2 cursor-hand"
                      data-bs-toggle="collapse"
                      data-bs-target="#trainerCertificates"
                      aria-expanded="false"
                      aria-controls="trainerCertificates"
                    >
                      Trainer Certificates
                    </h5>
                    <button
                      className="btn btn-light"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#trainerCertificates"
                      aria-expanded="false"
                      aria-controls="trainerCertificates"
                    >
                      <i className="fa fa-angle-down text-primary" />
                    </button>
                  </div>

                  <div className="collapse mt-2" id="trainerCertificates">
                    <div className="card card-body shadow-none p-2">
                      <table className="table table-sm">
                        <tbody>
                          {userDetails?.certificates?.map(
                            (certificate: any) => {
                              return (
                                <tr>
                                  <td scope="row">{certificate?.title}</td>
                                  <td>
                                    <iframe
                                      src={certificate?.certificateFile}
                                      width="500"
                                      height="250"
                                      frameBorder="0"
                                    >
                                      Your browser does not support iframes.
                                    </iframe>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}
