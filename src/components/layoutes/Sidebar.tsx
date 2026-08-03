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
    "/govt-policies/govt-engagements",
  ];
  const [govtPoliciesOpen, setGovtPoliciesOpen] = useState(
    govtPolicyPaths.includes(location.pathname),
  );
  const memberListPaths = ["/member-list/primary", "/member-list/associate"];
  const [membersOpen, setMembersOpen] = useState(memberListPaths.includes(location.pathname));

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
    if (memberListPaths.includes(location.pathname)) {
      setMembersOpen(true);
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

        <li className={`nav-item ${handleActiveMenu(["/media"])}`}>
          <Link className="nav-link" to="/media">
            <i className="ti-image menu-icon"></i>
            <span className="menu-title">Media</span>
          </Link>
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
            </ul>
          </div>
        </li>

        <li className={`nav-item ${handleActiveMenu(["/marketplaces"])}`}>
          <Link className="nav-link" to="/marketplaces">
            <i className="ti-shopping-cart menu-icon"></i>
            <span className="menu-title">Marketplaces</span>
          </Link>
        </li>

        {/* Blog */}
        <li
          className={`nav-item ${handleActiveMenu([
            "/blogCategories",
            "/authors",
            "/posts",
          ])}`}
        >
          <a
            className="nav-link dnone"
            data-bs-toggle="collapse"
            href="#blog"
            aria-expanded="false"
            aria-controls="blog"
          >
            <i className="ti-layers menu-icon"></i>
            <span className="menu-title">Blog</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="blog">
            <ul className="nav flex-column sub-menu">
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

              <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/posts")}`}
                  to="/posts"
                >
                  Posts
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
            "/aboutpage",
            "/executive-council-page",
            "/executive-council-members",
            "/past-chairmen-page",
            "/sub-committees-page",
            "/industry-details-page",
            "/report-page",
            "/contactpage",
            "/admin/contact-page",
            "/blogpage",
            "galleryCategories",
            "galleryImages",
            "/certificatepage",
            "sustainabilityPage",
            "resourcePage",
            "faqsCategory",
            "faqs",
            "/privacypolicy",
            "/termandconditions",
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

              <li className="nav-item d-none">
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
              <li className="nav-item d-none">
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
                  className={`nav-link ${handleActiveLink("/govt-policies/quality-control-order")}`}
                  to="/govt-policies/quality-control-order"
                >
                  Quality Control Order
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
                  className={`nav-link ${handleActiveLink("/govt-policies/energy-conservation")}`}
                  to="/govt-policies/energy-conservation"
                >
                  Energy Conservation
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
          className={`nav-item ${handleActiveMenu([
            "/newsletters",
            "/inquiries",
            "/admin/contact-inquiries",
            "/notifyMe",
            "orders",
          ])}`}
        >
          <a
            className="nav-link"
            data-bs-toggle="collapse"
            href="#inquiries"
            aria-expanded="false"
            aria-controls="inquiries"
          >
            <i className="ti-email menu-icon"></i>
            <span className="menu-title">Inquiries</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="inquiries">
            <ul className="nav flex-column sub-menu">
              {/* <li className="nav-item">
                <Link
                  className={`nav-link ${handleActiveLink("/inquiries")}`}
                  to="/inquiries"
                >
                  Page Inquiry
                </Link>
              </li> */}
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
