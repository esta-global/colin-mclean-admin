import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isCategoryPath =
    location.pathname === "/blogCategories" ||
    location.pathname === "/blogCategories/add" ||
    location.pathname.startsWith("/blogCategories/edit/");

  const blogPaths = [
    "/posts",
    "/posts/add",
  ];
  const isBlogPath =
    blogPaths.includes(location.pathname) ||
    location.pathname.startsWith("/posts/edit/") ||
    location.pathname.startsWith("/posts/details/");

  const pagePaths = ["/homepage", "/aboutpage"];
  const isPagePath = pagePaths.includes(location.pathname);

  const isInquiryPath =
    location.pathname === "/admin/contact-inquiries" ||
    location.pathname.startsWith("/admin/contact-inquiries/") ||
    location.pathname === "/contact-inquiries" ||
    location.pathname.startsWith("/contact-inquiries/");

  const [blogOpen, setBlogOpen] = useState(isBlogPath);
  const [pagesOpen, setPagesOpen] = useState(isPagePath);

  useEffect(() => {
    if (isBlogPath) setBlogOpen(true);
    if (isPagePath) setPagesOpen(true);
  }, [isBlogPath, isPagePath]);

  function handleActiveMenu(paths: string[]) {
    return paths.includes(location.pathname) ? "active" : "";
  }

  function handleActiveLink(path: string) {
    return location.pathname === path ? "active" : "";
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        {/* Dashboard */}
        <li className={`nav-item ${handleActiveMenu(["/"])}`}>
          <Link className="nav-link" to="/">
            <i className="ti-shield menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </Link>
        </li>

        {/* Main Category Management */}
        <li className={`nav-item ${isCategoryPath ? "active" : ""}`}>
          <Link className="nav-link" to="/blogCategories">
            <i className="ti-layout-grid2 menu-icon"></i>
            <span className="menu-title">Main Categories</span>
          </Link>
        </li>

        {/* Blog Management */}
        <li className={`nav-item ${isBlogPath ? "active" : ""}`}>
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#blogMenu"
            aria-expanded={blogOpen}
            aria-controls="blogMenu"
            onClick={(e) => {
              e.preventDefault();
              setBlogOpen(!blogOpen);
            }}
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Blog Management</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${blogOpen ? "show" : ""}`} id="blogMenu">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/posts")}`} to="/posts">
                  All Blogs
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/posts/add")}`} to="/posts/add">
                  Add Blog
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/blogCategories")}`} to="/blogCategories">
                  All Categories
                </Link>
              </li>
            </ul>
          </div>
        </li>


        {/* Pages Management */}
        <li className={`nav-item ${isPagePath ? "active" : ""}`}>
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#pagesMenu"
            aria-expanded={pagesOpen}
            aria-controls="pagesMenu"
            onClick={(e) => {
              e.preventDefault();
              setPagesOpen(!pagesOpen);
            }}
          >
            <i className="ti-layout menu-icon"></i>
            <span className="menu-title">Pages Management</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${pagesOpen ? "show" : ""}`} id="pagesMenu">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/homepage")}`} to="/homepage">
                  Home Page
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/aboutpage")}`} to="/aboutpage">
                  About Page
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Contact Inquiries */}
        <li className={`nav-item ${isInquiryPath ? "active" : ""}`}>
          <Link className="nav-link" to="/admin/contact-inquiries">
            <i className="ti-email menu-icon"></i>
            <span className="menu-title">Contact Enquiries</span>
          </Link>
        </li>

        {/* Media Library */}
        <li className={`nav-item ${location.pathname.startsWith("/media") ? "active" : ""}`}>
          <Link className="nav-link" to="/media">
            <i className="ti-image menu-icon"></i>
            <span className="menu-title">Media Library</span>
          </Link>
        </li>
      </ul>

      <div className="ss-sidebar-footer">
        <button type="button" onClick={handleLogout}>
          <i className="ti-power-off"></i>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
