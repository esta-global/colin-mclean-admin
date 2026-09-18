import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Face from "../../assets/images/faces/face0.png";

export function Header() {
  const navigation = useNavigate();
  function handleDesktopSidebar(evt: React.MouseEvent<HTMLElement>) {
    evt.preventDefault();
    document.body.classList.toggle("sidebar-icon-only");
  }
  function handleMobileSidebar(evt: React.MouseEvent<HTMLElement>) {
    evt.preventDefault();
    const sidebar = document.getElementById("sidebar");
    sidebar?.classList.toggle("active");
  }

  function handelLogout(evt: React.MouseEvent<HTMLElement>) {
    evt.preventDefault();
    localStorage.removeItem("token");
    navigation("/login");
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigation("/login");
    }
  }, []);

  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start px-3">
        <Link className="navbar-brand brand-logo me-0 d-flex align-items-center" to="/">
          <span className="cm-admin-wordmark">Colin McLean</span>
        </Link>
        <Link className="navbar-brand brand-logo-mini" to="/">
          <span className="cm-admin-wordmark-mini">CM</span>
        </Link>
      </div>
      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <button
          className="navbar-toggler navbar-toggler align-self-center"
          type="button"
          onClick={handleDesktopSidebar}
          aria-label="Toggle desktop sidebar"
        >
          <span className="ti-view-list"></span>
        </button>
        <ul className="navbar-nav mr-lg-2 search-box-container">
          <li className="nav-item nav-search d-none d-lg-block">
            <span className="cm-workspace-badge">Admin Studio</span>
          </li>
        </ul>
        <ul className="navbar-nav navbar-nav-right">
          {/* <li className="nav-item dropdown me-1">
            <a
              className="nav-link count-indicator dropdown-toggle d-flex justify-content-center align-items-center"
              id="messageDropdown"
              href="#"
              data-bs-toggle="dropdown"
            >
              <i className="ti-email mx-0"></i>
            </a>
            <div
              className="dropdown-menu dropdown-menu-right navbar-dropdown"
              aria-labelledby="messageDropdown"
            >
              <p className="mb-0 font-weight-normal float-left dropdown-header">
                Messages
              </p>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <img
                    src="/images/faces/face4.jpg"
                    alt="image"
                    className="profile-pic"
                  />
                </div>
                <div className="item-content flex-grow">
                  <h6 className="ellipsis font-weight-normal">David Grey</h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    The meeting is cancelled
                  </p>
                </div>
              </a>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <img
                    src="/images/faces/face2.jpg"
                    alt="image"
                    className="profile-pic"
                  />
                </div>
                <div className="item-content flex-grow">
                  <h6 className="ellipsis font-weight-normal">Tim Cook</h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    New product launch
                  </p>
                </div>
              </a>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <img
                    src="/images/faces/face3.jpg"
                    alt="image"
                    className="profile-pic"
                  />
                </div>
                <div className="item-content flex-grow">
                  <h6 className="ellipsis font-weight-normal"> Johnson</h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    Upcoming board meeting
                  </p>
                </div>
              </a>
            </div>
          </li> */}
          {/* <li className="nav-item dropdown">
            <a
              className="nav-link count-indicator dropdown-toggle"
              id="notificationDropdown"
              href="#"
              data-bs-toggle="dropdown"
            >
              <i className="ti-bell mx-0"></i>
              <span className="count"></span>
            </a>
            <div
              className="dropdown-menu dropdown-menu-right navbar-dropdown"
              aria-labelledby="notificationDropdown"
            >
              <p className="mb-0 font-weight-normal float-left dropdown-header">
                Notifications
              </p>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <div className="item-icon bg-success">
                    <i className="ti-info-alt mx-0"></i>
                  </div>
                </div>
                <div className="item-content">
                  <h6 className="font-weight-normal">Application Error</h6>
                  <p className="font-weight-light small-text mb-0 text-muted">
                    Just now
                  </p>
                </div>
              </a>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <div className="item-icon bg-warning">
                    <i className="ti-settings mx-0"></i>
                  </div>
                </div>
                <div className="item-content">
                  <h6 className="font-weight-normal">Settings</h6>
                  <p className="font-weight-light small-text mb-0 text-muted">
                    Private message
                  </p>
                </div>
              </a>
              <a className="dropdown-item">
                <div className="item-thumbnail">
                  <div className="item-icon bg-info">
                    <i className="ti-user mx-0"></i>
                  </div>
                </div>
                <div className="item-content">
                  <h6 className="font-weight-normal">New user registration</h6>
                  <p className="font-weight-light small-text mb-0 text-muted">
                    2 days ago
                  </p>
                </div>
              </a>
            </div>
          </li> */}
          <li className="nav-item nav-profile dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              data-bs-toggle="dropdown"
              id="profileDropdown"
            >
              <img src={Face} alt="profile" />
            </a>
            <div
              className="dropdown-menu dropdown-menu-right navbar-dropdown"
              aria-labelledby="profileDropdown"
            >
              {/* <a className="dropdown-item">
                <i className="ti-settings text-primary"></i>
                Settings
              </a> */}
              <a className="dropdown-item" onClick={handelLogout}>
                <i className="ti-power-off text-primary"></i>
                Logout
              </a>
            </div>
          </li>
        </ul>
        <button
          className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
          type="button"
          // data-toggle="offcanvas"
          onClick={handleMobileSidebar}
        >
          <span className="ti-view-list"></span>
        </button>
      </div>
    </nav>
  );
}
