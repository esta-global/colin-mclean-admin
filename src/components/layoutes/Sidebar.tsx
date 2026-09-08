import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [executiveCouncilOpen, setExecutiveCouncilOpen] = useState(
    location.pathname === "/executive-council-page" ||
      location.pathname === "/executive-council-members",
  );
  const govtPolicyPaths = [
    "/govt-policies/bis-specifications",
    "/govt-policies/quality-control-order",
    "/govt-policies/bee-star-rating",
    "/govt-policies/energy-conservation",
    "/govt-policies/atmanirbhar",
    "/govt-policies/govt-engagements",
  ];
  const [govtPoliciesOpen, setGovtPoliciesOpen] = useState(
    govtPolicyPaths.includes(location.pathname),
  );
  const mediaPaths = ["/media", "/media/add", "/media/press-releases", "/media/images", "/media/videos"];
  const [mediaOpen, setMediaOpen] = useState(mediaPaths.includes(location.pathname));
  const contentPaths = [
    "/blogCategories",
    "/blogCategories/add",
    "/authors",
    "/authors/add",
    "/posts",
    "/posts/add",
    "/trivia-posts",
    "/trivia-posts/add",
  ];
  const isContentPath = contentPaths.includes(location.pathname) ||
    location.pathname.startsWith("/blogCategories/edit/") ||
    location.pathname.startsWith("/authors/edit/") ||
    location.pathname.startsWith("/posts/edit/") ||
    location.pathname.startsWith("/posts/details/") ||
    location.pathname.startsWith("/trivia-posts/edit/") ||
    location.pathname.startsWith("/trivia-posts/details/");
  const [contentOpen, setContentOpen] = useState(isContentPath);
  const memberListPaths = [
    "/member-list/primary",
    "/member-list/associate",
    "/membership-pages/types-of-membership",
    "/membership-pages/become-a-member",
  ];
  const [membersOpen, setMembersOpen] = useState(memberListPaths.includes(location.pathname));
  const isInquiryPath =
    location.pathname === "/inquiries" ||
    location.pathname.startsWith("/inquiries/") ||
    location.pathname === "/admin/contact-inquiries" ||
    location.pathname.startsWith("/admin/contact-inquiries/");
  const [inquiriesOpen, setInquiriesOpen] = useState(isInquiryPath);

  useEffect(() => {
    if (
      location.pathname === "/executive-council-page" ||
      location.pathname === "/executive-council-members"
    ) {
      setExecutiveCouncilOpen(true);
    }
    if (govtPolicyPaths.includes(location.pathname)) {
      setGovtPoliciesOpen(true);
    }
    if (mediaPaths.includes(location.pathname)) {
      setMediaOpen(true);
    }
    if (isContentPath) {
      setContentOpen(true);
    }
    if (memberListPaths.includes(location.pathname)) {
      setMembersOpen(true);
    }
    if (isInquiryPath) {
      setInquiriesOpen(true);
    }
  }, [location.pathname]);

  function handleActiveMenu(paths: string[]) {
    if (paths.includes(location.pathname)) return "active";
    else return "";
  }

  function handleActiveLink(path: string) {
    if (location.pathname == path) return "active";
    else return "";
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className={`nav-item ${handleActiveMenu(["/"])}`}>
          <Link className="nav-link" to="/">
            <i className="ti-shield menu-icon"></i>
            {/* <TfiDashboard className="menu-icon" /> */}
            <span className="menu-title">Dashboard</span>
          </Link>
        </li>
        <li
          className={`nav-item dnone ${handleActiveMenu([
            "/carousels",
            "/categoryShowcase",
            "/coupons",
          ])}`}
        >
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#setting"
            aria-expanded="false"
            aria-controls="setting"
          >
            <i className="ti-settings menu-icon"></i>
            <span className="menu-title">Setting</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="setting">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item d-none">
                <Link
                  className={`nav-link ${handleActiveLink("/coupons")}`}
                  to="/coupons"
                >
                  Coupons
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/carousels")}`}
                  to="/carousels"
                >
                  Carousel
                </Link>
              </li>
            </ul>
          </div>
        </li>

        <li className={`nav-item ${handleActiveMenu(["/users"])}`}>
          <Link className="nav-link" to="/users">
            <i className="ti-user menu-icon"></i>
            <span className="menu-title">Users</span>
          </Link>
        </li>

        <li className={`nav-item ${handleActiveMenu(mediaPaths)}`}>
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#mediaPages"
            aria-expanded={mediaOpen}
            aria-controls="mediaPages"
            onClick={() => setMediaOpen((isOpen) => !isOpen)}
          >
            <i className="ti-image menu-icon"></i>
            <span className="menu-title">Media</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${mediaOpen ? "show" : ""}`} id="mediaPages">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/media")}`} to="/media">
                  Media Library
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/media/press-releases")}`} to="/media/press-releases">
                  Press Releases Page
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/media/images")}`} to="/media/images">
                  Media Images Page
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${handleActiveLink("/media/videos")}`} to="/media/videos">
                  Videos Page
                </Link>
              </li>
            </ul>
          </div>
        </li>

        <li className={`nav-item ${handleActiveMenu(["/listings"])}`}>
          <Link className="nav-link" to="/listings">
            <i className="ti-list menu-icon"></i>
            <span className="menu-title">Listings</span>
          </Link>
        </li>

        <li className={`nav-item ${handleActiveMenu(memberListPaths)}`}>
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#members"
            aria-expanded={membersOpen}
            aria-controls="members"
            onClick={() => setMembersOpen((isOpen) => !isOpen)}
          >
            <i className="ti-id-badge menu-icon"></i>
            <span className="menu-title">Members</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${membersOpen ? "show" : ""}`} id="members">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/member-list/primary")}`}
                  to="/member-list/primary"
                >
                  Primary Member List
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/member-list/associate")}`}
                  to="/member-list/associate"
                >
                  Associate Member List
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/membership-pages/types-of-membership")}`}
                  to="/membership-pages/types-of-membership"
                >
                  Types Of Membership
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/membership-pages/become-a-member")}`}
                  to="/membership-pages/become-a-member"
                >
                  Become A Member
                </Link>
              </li>
            </ul>
          </div>
        </li>

        <li className={`nav-item ${handleActiveMenu(["/marketplaces"])}`}>
          <Link className="nav-link" to="/marketplaces">
            <i className="ti-shopping-cart menu-icon"></i>
            <span className="menu-title">Marketplaces</span>
          </Link>
        </li>

        {/* Content */}
        <li
          className={`nav-item ${isContentPath ? "active" : ""}`}
        >
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#blog"
            aria-expanded={contentOpen}
            aria-controls="blog"
            onClick={() => setContentOpen((isOpen) => !isOpen)}
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Content</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${contentOpen ? "show" : ""}`} id="blog">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/posts")}`}
                  to="/posts"
                >
                  Blogs
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/trivia-posts")}`}
                  to="/trivia-posts"
                >
                  Trivia
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/blogCategories")}`}
                  to="/blogCategories"
                >
                  Categories
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/authors")}`}
                  to="/authors"
                >
                  Authors
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Categories */}
        {/* <li
          className={`nav-item ${handleActiveMenu([
            "/categories",
            "/subCategories",
          ])}`}
        >
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#categories"
            aria-expanded="false"
            aria-controls="categories"
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Categories</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="categories">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/categories")}`}
                  to="/categories"
                >
                  Categories
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/subCategories")}`}
                  to="/subCategories"
                >
                  Sub Categories
                </Link>
              </li>
            </ul>
          </div>
        </li> */}

        {/* Promotions */}
        <li
          className={`nav-item d-none ${handleActiveMenu(["/promotionTexts"])}`}
        >
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#promotions"
            aria-expanded="false"
            aria-controls="promotions"
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Promotions</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="promotions">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/promotionTexts")}`}
                  to="/promotionTexts"
                >
                  Promotion Text
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Pages */}
        <li
          className={`dnone nav-item ${handleActiveMenu([
            "/homepage",
            "/header-management",
            "/aboutpage",
            "/executive-council-page",
            "/executive-council-members",
            "/past-chairmen-page",
            "/sub-committees-page",
            "/industry-details-page",
            "/report-page",
            "/past-events-page",
            "/contactpage",
            "/admin/contact-page",
            "/blogpage",
            "galleryCategories",
            "galleryImages",
            "/certificatepage",
            "/sustainabilityPage",
            "resourcePage",
            "faqsCategory",
            "faqs",
            "/privacypolicy",
            "/termandconditions",
            "/bis-bee-page",
          ])}`}
        >
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#pages"
            aria-expanded="false"
            aria-controls="pages"
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Pages</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="pages">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/header-management")}`}
                  to="/header-management"
                >
                  Header Management
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/homepage")}`}
                  to="/homepage"
                >
                  Home Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/aboutpage")}`}
                  to="/aboutpage"
                >
                  About Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/bis-bee-page")}`}
                  to="/bis-bee-page"
                >
                  BIS &amp; BEE Page
                </Link>
              </li>

              <li className="nav-item">
                <div className="sidebar-parent-link">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/executive-council-page" ||
                      location.pathname === "/executive-council-members"
                        ? "active"
                        : ""
                    }`}
                    to="/executive-council-page"
                  >
                    Executive Council Page
                  </Link>
                  <button
                    aria-label="Toggle executive council child menu"
                    aria-expanded={executiveCouncilOpen}
                    onClick={() => setExecutiveCouncilOpen((isOpen) => !isOpen)}
                    type="button"
                  >
                    <i className={`ti-angle-${executiveCouncilOpen ? "up" : "down"}`}></i>
                  </button>
                </div>
                <ul className={`nav flex-column sidebar-child-menu ${executiveCouncilOpen ? "is-open" : ""}`}>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${handleActiveLink("/executive-council-members")}`}
                      to="/executive-council-members"
                    >
                      EC Members
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/past-chairmen-page")}`}
                  to="/past-chairmen-page"
                >
                  Past Chairmen Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/sub-committees-page")}`}
                  to="/sub-committees-page"
                >
                  Sub Committees Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/industry-details-page")}`}
                  to="/industry-details-page"
                >
                  Industry Details Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/report-page")}`}
                  to="/report-page"
                >
                  Report Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/past-events-page")}`}
                  to="/past-events-page"
                >
                  Past Events Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/admin/contact-page")}`}
                  to="/admin/contact-page"
                >
                  Contact Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/blogpage")}`}
                  to="/blogpage"
                >
                  Blog Page
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/privacypolicy")}`}
                  to="/privacypolicy"
                >
                  Privacy Policy
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/termandconditions")}`}
                  to="/termandconditions"
                >
                  Terms and Conditions
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink(
                    "/galleryCategories",
                  )}`}
                  to="/galleryCategories"
                >
                  Gallery Category
                </Link>
              </li>

              <li className="nav-item d-none">
                <Link
                  className={`nav-link ${handleActiveLink("/gallerypage")}`}
                  to="/gallerypage"
                >
                  Gallery Page
                </Link>
              </li>
              <li className="nav-item d-none">
                <Link
                  className={`nav-link ${handleActiveLink("/galleryImages")}`}
                  to="/galleryImages"
                >
                  Gallery
                </Link>
              </li>
              <li className="nav-item d-none">
                <Link
                  className={`nav-link ${handleActiveLink("/certificatepage")}`}
                  to="/certificatepage"
                >
                  Certificate Page
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink(
                    "/sustainabilityPage",
                  )}`}
                  to="/sustainabilityPage"
                >
                  Sustainability Page
                </Link>
              </li>

              <li className="nav-item d-none">
                <Link
                  className={`nav-link ${handleActiveLink("/resourcePage")}`}
                  to="/resourcePage"
                >
                  Resource Page
                </Link>
              </li>
              <li className="nav-item d-none">
                <Link
                  className={`nav-link ${handleActiveLink("/faqsCategory")}`}
                  to="/faqsCategory"
                  >
                  Resource FaQs Category
                </Link>
              </li>

              <li className="nav-item d-none">
                <Link
                  className={`nav-link ${handleActiveLink("/faqs")}`}
                  to="/faqs"
                >
                  Resource FaQs
                </Link>
              </li>
            </ul>
          </div>
        </li>

        <li className={`nav-item ${handleActiveMenu(govtPolicyPaths)}`}>
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#govtPolicies"
            aria-expanded={govtPoliciesOpen}
            aria-controls="govtPolicies"
            onClick={() => setGovtPoliciesOpen((isOpen) => !isOpen)}
          >
            <i className="ti-clipboard menu-icon"></i>
            <span className="menu-title">Govt Policies</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${govtPoliciesOpen ? "show" : ""}`} id="govtPolicies">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/govt-policies/bis-specifications")}`}
                  to="/govt-policies/bis-specifications"
                >
                  BIS Specifications
                </Link>
              </li>
             
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${handleActiveLink("/govt-policies/bee-star-rating")}`}
                      to="/govt-policies/bee-star-rating"
                    >
                      BEE Star Rating
                    </Link>
                  </li>
              
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/govt-policies/atmanirbhar")}`}
                  to="/govt-policies/atmanirbhar"
                >
                  Atmanirbhar
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/govt-policies/govt-engagements")}`}
                  to="/govt-policies/govt-engagements"
                >
                  Government Engagements
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Orders */}
        {/* <li
          className={`nav-item ${handleActiveMenu([
            "/orders/falseOrders",
            "/orders",
          ])}`}
        >
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#orders"
            aria-expanded="false"
            aria-controls="orders"
          >
            <i className="ti-user menu-icon"></i>
            <span className="menu-title">Product Inquiry</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="orders">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/orders")}`}
                  to="/orders"
                >
                  Inquiry
                </Link>
              </li>
            </ul>
          </div>
        </li> */}

        {/* Inquiries */}
        <li
          className={`nav-item ${isInquiryPath ? "active" : ""}`}
        >
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#inquiries"
            aria-expanded={inquiriesOpen}
            aria-controls="inquiries"
            onClick={() => setInquiriesOpen((isOpen) => !isOpen)}
          >
            <i className="ti-email menu-icon"></i>
            <span className="menu-title">Inquiries</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${inquiriesOpen ? "show" : ""}`} id="inquiries">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/inquiries")}`}
                  to="/inquiries"
                >
                  Page Inquiries
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink(
                    "/admin/contact-inquiries",
                  )}`}
                  to="/admin/contact-inquiries"
                >
                  Contact Inquiries
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/newsletters")}`}
                  to="/newsletters"
                >
                  Newsletter Emails
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/notifyMe")}`}
                  to="/notifyMe"
                >
                  Notify Me
                </Link>
              </li> */}
            </ul>
          </div>
        </li>

        {/* Products */}
        <li
          className={`nav-item ${handleActiveMenu([
            "/sizes",
            "/materials",
            "/shapes",
            "/colors",
            "/thickness",
            "/badges",
            "/features",
            "/products",
            "/reviews",
          ])}`}
        >
          <a
            className="nav-link d-none"
            data-bs-toggle="collapse"
            href="#products"
            aria-expanded="false"
            aria-controls="products"
          >
            <i className="ti-files menu-icon"></i>
            <span className="menu-title">Products</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="products">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/features")}`}
                  to="/features"
                >
                  Features
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/certifications")}`}
                  to="/certifications"
                >
                  Certifications
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/shapes")}`}
                  to="/shapes"
                >
                  Shapes
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/sizes")}`}
                  to="/sizes"
                >
                  Sizes
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/materials")}`}
                  to="/materials"
                >
                  Materials
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/colors")}`}
                  to="/colors"
                >
                  Colors
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/thickness")}`}
                  to="/thickness"
                >
                  Thickness
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/badges")}`}
                  to="/badges"
                >
                  Badges
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/products")}`}
                  to="/products"
                >
                  Products
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/productReviews")}`}
                  to="/productReviews"
                >
                  Reviews
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* <li className={`nav-item ${handleActiveMenu(["/wishlists"])}`}>
          <Link className="nav-link" to="/wishlists">
            <i className="ti-image menu-icon"></i>
            <span className="menu-title">Wishlists</span>
          </Link>
        </li> */}

        <li className={`nav-item d-none ${handleActiveMenu(["/orders"])}`}>
          <Link className="nav-link" to="/orders">
            <i className="ti-image menu-icon"></i>
            <span className="menu-title">Orders</span>
          </Link>
        </li>

        {/* <li className="nav-item">
          <a className="nav-link" href="pages/charts/chartjs.html">
            <i className="ti-power-off menu-icon"></i>
            <span className="menu-title">Logout</span>
          </a>
        </li> */}

        {/* <li className="nav-item">
          <a className="nav-link" href="pages/charts/chartjs.html">
            <i className="ti-power-off menu-icon"></i>
            <span className="menu-title">Pages</span>
          </a>
        </li> */}
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
