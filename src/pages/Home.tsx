import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import { enUS } from "date-fns/locale";
import moment from "moment";
import {
  LuActivity,
  LuArrowDownRight,
  LuArrowRight,
  LuArrowUpRight,
  LuBarChart3,
  LuBell,
  LuCalendarDays,
  LuCheckCircle2,
  LuChevronDown,
  LuClipboardList,
  LuClock3,
  LuExternalLink,
  LuFileText,
  LuHeart,
  LuLineChart,
  LuMail,
  LuPackage,
  LuPlug,
  LuRefreshCw,
  LuSettings,
  LuSparkles,
  LuStore,
  LuTrendingUp,
  LuUsers,
  LuZap,
} from "react-icons/lu";

type DashboardStatCardProps = {
  title: string;
  value: string | number | undefined;
  description: string;
  trend?: number;
  trendLabel?: string | number;
  icon: ReactNode;
  onClick?: () => void;
};

type QuickActionProps = {
  title: string;
  description: string;
  cta: string;
  icon: ReactNode;
  onClick: () => void;
};

type DemoUser = {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  countryCode: string;
  status: boolean;
  isDeleted: boolean;
  createdAt: string;
};

type DemoListing = {
  _id: string;
  title: string;
  userName: string;
  marketplace: string;
  category: string;
  price: number;
  condition: string;
  confidence_score: number;
  status: boolean;
  isDeleted: boolean;
  createdAt: string;
  images: string[];
};

type DemoBlog = {
  _id: string;
  title: string;
  slug: string;
  authorName: string;
  categoryName: string;
  excerpt: string;
  status: boolean;
  isDeleted: boolean;
  createdAt: string;
};

const demoUsers: DemoUser[] = [
  {
    _id: "u1",
    name: "Ananya Verma",
    email: "ananya@example.com",
    mobile: "9876543210",
    countryCode: "+91",
    status: true,
    isDeleted: false,
    createdAt: "2026-07-22T08:10:00Z",
  },
  {
    _id: "u2",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    mobile: "9811122233",
    countryCode: "+91",
    status: true,
    isDeleted: false,
    createdAt: "2026-07-19T09:35:00Z",
  },
  {
    _id: "u3",
    name: "Sana Khan",
    email: "sana@example.com",
    mobile: "9900011122",
    countryCode: "+91",
    status: false,
    isDeleted: false,
    createdAt: "2026-07-16T12:50:00Z",
  },
  {
    _id: "u4",
    name: "Vikram Singh",
    email: "vikram@example.com",
    mobile: "9988776655",
    countryCode: "+91",
    status: true,
    isDeleted: false,
    createdAt: "2026-07-11T15:20:00Z",
  },
  {
    _id: "u5",
    name: "Meera Joshi",
    email: "meera@example.com",
    mobile: "9765432100",
    countryCode: "+91",
    status: true,
    isDeleted: true,
    createdAt: "2026-07-05T06:45:00Z",
  },
];

const demoListings: DemoListing[] = [
  {
    _id: "l1",
    title: "Vintage Brass Table Lamp",
    userName: "Ananya Verma",
    marketplace: "Amazon",
    category: "Home Decor",
    price: 3499,
    condition: "Used - Good",
    confidence_score: 92,
    status: true,
    isDeleted: false,
    createdAt: "2026-07-22T11:10:00Z",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    ],
  },
  {
    _id: "l2",
    title: "Wooden Office Chair",
    userName: "Rahul Mehta",
    marketplace: "Flipkart",
    category: "Furniture",
    price: 5499,
    condition: "Refurbished",
    confidence_score: 84,
    status: true,
    isDeleted: false,
    createdAt: "2026-07-21T13:25:00Z",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400",
    ],
  },
  {
    _id: "l3",
    title: "Leather Sling Bag",
    userName: "Sana Khan",
    marketplace: "eBay",
    category: "Accessories",
    price: 2199,
    condition: "New",
    confidence_score: 88,
    status: false,
    isDeleted: false,
    createdAt: "2026-07-18T10:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400",
    ],
  },
  {
    _id: "l4",
    title: "Ceramic Tea Set",
    userName: "Vikram Singh",
    marketplace: "Shopify",
    category: "Kitchenware",
    price: 1599,
    condition: "New",
    confidence_score: 79,
    status: true,
    isDeleted: false,
    createdAt: "2026-07-14T08:15:00Z",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    ],
  },
];

const demoBlogs: DemoBlog[] = [
  {
    _id: "b1",
    title: "How to write better product titles",
    slug: "write-better-product-titles",
    authorName: "Editorial Team",
    categoryName: "Selling Tips",
    excerpt:
      "Short, search-friendly titles can improve discoverability and clicks.",
    status: true,
    isDeleted: false,
    createdAt: "2026-07-23T07:45:00Z",
  },
  {
    _id: "b2",
    title: "What buyers expect in a clean listing",
    slug: "clean-listing-expectations",
    authorName: "Aditi Sharma",
    categoryName: "Marketplace",
    excerpt:
      "Good images, clear condition notes, and honest pricing build trust.",
    status: true,
    isDeleted: false,
    createdAt: "2026-07-20T09:20:00Z",
  },
  {
    _id: "b3",
    title: "Best categories for fast-moving inventory",
    slug: "fast-moving-inventory-categories",
    authorName: "Editorial Team",
    categoryName: "Insights",
    excerpt: "Focus on categories that keep rotation high and returns low.",
    status: false,
    isDeleted: false,
    createdAt: "2026-07-17T10:30:00Z",
  },
];

function formatNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue)
    ? numberValue.toLocaleString("en-IN")
    : "0";
}

function formatMoney(value: unknown) {
  const numberValue = Number(value || 0);
  return `₹${Number.isFinite(numberValue) ? numberValue.toLocaleString("en-IN") : "0"}`;
}

function formatPercent(value: unknown) {
  const numberValue = Number(value || 0);
  return `${Math.round(Number.isFinite(numberValue) ? numberValue : 0)}%`;
}

function isWithinRange(date: string, startDate: Date, endDate: Date) {
  return moment(date).isBetween(
    moment(startDate),
    moment(endDate),
    "day",
    "[]",
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function TrendBadge({
  trend,
  label,
}: {
  trend?: number;
  label?: string | number;
}) {
  const isDown = Number(trend || 0) < 0;

  return (
    <span className={`ss-dashboard-trend ${isDown ? "is-down" : "is-up"}`}>
      {isDown ? <LuArrowDownRight /> : <LuArrowUpRight />}
      {label ?? `${Math.abs(Number(trend || 0))}%`}
    </span>
  );
}

function DashboardStatCard({
  title,
  value,
  description,
  trend,
  trendLabel,
  icon,
  onClick,
}: DashboardStatCardProps) {
  return (
    <button className="ss-dashboard-stat-card" type="button" onClick={onClick}>
      <span className="ss-dashboard-stat-card__icon">{icon}</span>
      <span className="ss-dashboard-stat-card__label">{title}</span>
      <strong>{value}</strong>
      <span className="ss-dashboard-stat-card__footer">
        <span>{description}</span>
        <TrendBadge trend={trend} label={trendLabel} />
      </span>
    </button>
  );
}

function QuickAction({
  title,
  description,
  cta,
  icon,
  onClick,
}: QuickActionProps) {
  return (
    <button
      className="ss-dashboard-action-card"
      type="button"
      onClick={onClick}
    >
      <span className="ss-dashboard-action-card__icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <em>
        {cta}
        <LuArrowRight />
      </em>
    </button>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="ss-dashboard-section-heading">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  isDeleted,
}: {
  status: boolean;
  isDeleted: boolean;
}) {
  if (isDeleted) {
    return <span className="ss-dashboard-status-badge">Deleted</span>;
  }

  return (
    <span className="ss-dashboard-status-badge">
      {status ? "Active" : "Draft"}
    </span>
  );
}

export function Home() {
  const navigate = useNavigate();

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: "selection",
  });

  const filteredUsers = demoUsers.filter((item) =>
    isWithinRange(
      item.createdAt,
      selectionRange.startDate,
      selectionRange.endDate,
    ),
  );
  const filteredListings = demoListings.filter((item) =>
    isWithinRange(
      item.createdAt,
      selectionRange.startDate,
      selectionRange.endDate,
    ),
  );
  const filteredBlogs = demoBlogs.filter((item) =>
    isWithinRange(
      item.createdAt,
      selectionRange.startDate,
      selectionRange.endDate,
    ),
  );

  const activeUsers = filteredUsers.filter(
    (item) => item.status && !item.isDeleted,
  ).length;
  const activeListings = filteredListings.filter(
    (item) => item.status && !item.isDeleted,
  ).length;
  const publishedBlogs = filteredBlogs.filter(
    (item) => item.status && !item.isDeleted,
  ).length;
  const draftBlogs = filteredBlogs.filter(
    (item) => !item.status && !item.isDeleted,
  ).length;
  const softDeletedRecords =
    filteredUsers.filter((item) => item.isDeleted).length +
    filteredListings.filter((item) => item.isDeleted).length +
    filteredBlogs.filter((item) => item.isDeleted).length;

  const averageConfidence = filteredListings.length
    ? filteredListings.reduce(
        (sum, item) => sum + Number(item.confidence_score || 0),
        0,
      ) / filteredListings.length
    : 0;

  const selectedRangeLabel = `${moment(selectionRange.startDate).format(
    "DD MMM YYYY",
  )} - ${moment(selectionRange.endDate).format("DD MMM YYYY")}`;

  const topListings = [...filteredListings]
    .sort(
      (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(),
    )
    .slice(0, 4);
  const topUsers = [...filteredUsers]
    .sort(
      (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(),
    )
    .slice(0, 4);
  const topBlogs = [...filteredBlogs]
    .sort(
      (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(),
    )
    .slice(0, 3);

  const quickActions = [
    {
      title: "Add User",
      description: "Create a new admin-managed seller profile.",
      cta: "Create",
      icon: <LuUsers />,
      onClick: () => navigate("/users/add"),
    },
    {
      title: "View Users",
      description: "Review active, draft, and soft-deleted users.",
      cta: "Open",
      icon: <LuUsers />,
      onClick: () => navigate("/users"),
    },
    {
      title: "View Listings",
      description: "Inspect marketplace listings and confidence scores.",
      cta: "Open",
      icon: <LuPackage />,
      onClick: () => navigate("/listings"),
    },
    {
      title: "Blog Content",
      description: "Edit blog page content and publishing blocks.",
      cta: "Manage",
      icon: <LuFileText />,
      onClick: () => navigate("/blogpage"),
    },
    {
      title: "Blog Categories",
      description: "Maintain categories used by blog entries.",
      cta: "Manage",
      icon: <LuClipboardList />,
      onClick: () => navigate("/blogCategories"),
    },
    {
      title: "Workspace Settings",
      description: "Adjust store and admin controls.",
      cta: "Open",
      icon: <LuSettings />,
      onClick: () => navigate("/marketplaces"),
    },
  ];

  const stats = [
    {
      title: "Users",
      value: formatNumber(filteredUsers.length),
      description: "Total user records in range",
      trend: 12,
      trendLabel: `${formatNumber(activeUsers)} active`,
      icon: <LuUsers />,
    },
    {
      title: "Listings",
      value: formatNumber(filteredListings.length),
      description: "Listings created or updated",
      trend: 8,
      trendLabel: `${formatNumber(activeListings)} live`,
      icon: <LuPackage />,
    },
    {
      title: "Blogs",
      value: formatNumber(filteredBlogs.length),
      description: "Blog records in this window",
      trend: 5,
      trendLabel: `${formatNumber(publishedBlogs)} published`,
      icon: <LuFileText />,
    },
    {
      title: "Draft Blogs",
      value: formatNumber(draftBlogs),
      description: "Posts waiting for publish",
      trend: -3,
      trendLabel: "Needs review",
      icon: <LuClock3 />,
    },
    {
      title: "Soft Deleted",
      value: formatNumber(softDeletedRecords),
      description: "Archived across all models",
      trend: -1,
      trendLabel: "Archived",
      icon: <LuCheckCircle2 />,
    },
    {
      title: "Avg Confidence",
      value: `${Math.round(averageConfidence)}%`,
      description: "Listing confidence score",
      trend: 7,
      trendLabel: "Model-based",
      icon: <LuTrendingUp />,
    },
  ];

  const activityItems = [
    {
      title: "User signups tracked",
      meta: `${formatNumber(activeUsers)} active users in the selected range`,
      icon: <LuUsers />,
    },
    {
      title: "Listings reviewed",
      meta: `${formatNumber(activeListings)} listings marked live`,
      icon: <LuRefreshCw />,
    },
    {
      title: "Blogs published",
      meta: `${formatNumber(publishedBlogs)} blog posts ready for readers`,
      icon: <LuFileText />,
    },
    {
      title: "Archived records",
      meta: `${formatNumber(softDeletedRecords)} soft-deleted entries stored safely`,
      icon: <LuActivity />,
    },
  ];

  return (
    <div className="content-wrapper ss-dashboard-page">
      <section className="ss-dashboard-hero">
        <div>
          <span className="ss-dashboard-eyebrow">
            <LuZap />
            IFMA Admin
          </span>
          <h1>Model dashboard preview</h1>
          <p>
            Ye temporary dashboard `userModel`, `listingModel`, aur `blogModel`
            ke around bana hai. Abhi dummy data use ho raha hai, isliye baad me
            direct API replace kar sakte ho without layout change.
          </p>
        </div>

        <div className="ss-dashboard-hero__panel">
          <div className="ss-dashboard-plan-card">
            <span>Snapshot Window</span>
            <strong>{selectedRangeLabel}</strong>
            <small>Demo data filtered by selected dates</small>
          </div>
          <div className="ss-dashboard-credit-mini">
            <span>Active Records</span>
            <strong>
              {formatNumber(activeUsers + activeListings + publishedBlogs)}
            </strong>
          </div>
          <button
            type="button"
            className="ss-dashboard-primary-btn"
            onClick={() => navigate("/listings")}
          >
            <LuSparkles />
            Open Listings
          </button>
        </div>
      </section>

      <section className="ss-dashboard-toolbar">
        <button
          type="button"
          className="ss-date-trigger"
          onClick={() => setCalendarVisible(!isCalendarVisible)}
        >
          <LuCalendarDays />
          {selectedRangeLabel}
          <LuChevronDown />
        </button>

        {isCalendarVisible && (
          <div className="ss-calendar-popover ss-dashboard-calendar-popover">
            <DateRangePicker
              ranges={[selectionRange]}
              onChange={(ranges: any) => {
                setSelectionRange(ranges.selection);
              }}
              locale={enUS}
              minDate={new Date("2024-01-01")}
              maxDate={new Date("2028-12-31")}
              direction="horizontal"
              editableDateInputs={true}
              scroll={{ enabled: false }}
              dateDisplayFormat="dd/MM/yyyy"
              rangeColors={["#1473ff"]}
            />

            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn ss-dashboard-secondary-btn"
                type="button"
                onClick={() => setCalendarVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="ss-dashboard-stat-grid">
        {stats.map((item) => (
          <DashboardStatCard key={item.title} {...item} />
        ))}
      </section>

      <section className="ss-dashboard-main-grid">
        <div className="ss-dashboard-main-column">
          <section className="ss-dashboard-panel">
            <SectionHeading
              icon={<LuSparkles />}
              title="Quick Actions"
              description="Model-based shortcuts for the admin team."
            />
            <div className="ss-dashboard-actions-grid">
              {quickActions.map((item) => (
                <QuickAction key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section className="ss-dashboard-panel">
            <div className="ss-dashboard-panel__top">
              <SectionHeading
                icon={<LuPackage />}
                title="Recent Listings"
                description="Latest listing records with model confidence."
              />
              <button
                type="button"
                className="ss-dashboard-link-btn"
                onClick={() => navigate("/listings")}
              >
                View all
                <LuExternalLink />
              </button>
            </div>

            {topListings.length ? (
              <div className="ss-dashboard-product-grid">
                {topListings.map((listing) => (
                  <article
                    className="ss-dashboard-product-card"
                    key={listing._id}
                  >
                    <div className="ss-dashboard-product-card__media">
                      {listing.images[0] ? (
                        <img src={listing.images[0]} alt={listing.title} />
                      ) : (
                        <LuStore />
                      )}
                      <StatusBadge
                        status={listing.status}
                        isDeleted={listing.isDeleted}
                      />
                    </div>
                    <div className="ss-dashboard-product-card__body">
                      <span>
                        {listing.marketplace} · {listing.category}
                      </span>
                      <h3>{listing.title}</h3>
                      <div>
                        <strong>{formatMoney(listing.price)}</strong>
                        <small>{listing.userName}</small>
                      </div>
                      <small>
                        {listing.condition} · Confidence{" "}
                        {formatPercent(listing.confidence_score)}
                      </small>
                    </div>
                    <div className="ss-dashboard-product-card__actions">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/listings/details/${listing._id}`)
                        }
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/listings")}
                      >
                        Manage
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ss-dashboard-empty-state">
                <LuPackage />
                <strong>No listings in this range</strong>
                <p>Try a wider date window to inspect listing activity.</p>
                <button type="button" onClick={() => navigate("/listings")}>
                  Open Listings
                </button>
              </div>
            )}
          </section>

          <section className="ss-dashboard-panel">
            <div className="ss-dashboard-panel__top">
              <SectionHeading
                icon={<LuFileText />}
                title="Recent Blogs"
                description="Blog model preview with publish state."
              />
              <button
                type="button"
                className="ss-dashboard-link-btn"
                onClick={() => navigate("/blogpage")}
              >
                Blog page
                <LuExternalLink />
              </button>
            </div>

            {topBlogs.length ? (
              <div className="ss-dashboard-product-grid">
                {topBlogs.map((blog) => (
                  <article className="ss-dashboard-product-card" key={blog._id}>
                    <div className="ss-dashboard-product-card__media">
                      <div className="ss-dashboard-avatar-fallback">
                        {getInitials(blog.title)}
                      </div>
                      <StatusBadge
                        status={blog.status}
                        isDeleted={blog.isDeleted}
                      />
                    </div>
                    <div className="ss-dashboard-product-card__body">
                      <span>
                        {blog.authorName} · {blog.categoryName}
                      </span>
                      <h3>{blog.title}</h3>
                      <div>
                        <strong>{blog.status ? "Published" : "Draft"}</strong>
                        <small>
                          {moment(blog.createdAt).format("DD MMM YYYY")}
                        </small>
                      </div>
                      <small>{blog.excerpt}</small>
                    </div>
                    <div className="ss-dashboard-product-card__actions">
                      <button
                        type="button"
                        onClick={() => navigate("/blogpage")}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/blogCategories")}
                      >
                        Manage
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ss-dashboard-empty-state">
                <LuFileText />
                <strong>No blogs in this range</strong>
                <p>Publish at least one blog post to see it here.</p>
                <button type="button" onClick={() => navigate("/blogpage")}>
                  Open Blog Page
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="ss-dashboard-side-column">
          <section className="ss-dashboard-panel ss-dashboard-credit-card">
            <SectionHeading
              icon={<LuStore />}
              title="Record Health"
              description="Quick model-level health summary."
            />
            <div className="ss-dashboard-credit-card__value">
              <strong>{formatNumber(activeUsers)}</strong>
              <span>active users</span>
            </div>
            <div className="ss-dashboard-progress">
              <span
                style={{
                  width: `${Math.min(100, (activeListings / Math.max(1, filteredListings.length)) * 100)}%`,
                }}
              ></span>
            </div>
            <div className="ss-dashboard-credit-card__meta">
              <span>{formatNumber(activeListings)} active listings</span>
              <span>{formatNumber(publishedBlogs)} published blogs</span>
            </div>
            <button type="button" onClick={() => navigate("/users")}>
              Manage Users
            </button>
          </section>

          <section className="ss-dashboard-panel">
            <SectionHeading
              icon={<LuUsers />}
              title="Recent Users"
              description="User model preview with status and contact details."
            />
            <div className="ss-dashboard-timeline">
              {topUsers.map((user) => (
                <article key={user._id}>
                  <span>{user.name.slice(0, 1)}</span>
                  <div>
                    <strong>{user.name}</strong>
                    <small>
                      {user.email} · {user.countryCode} {user.mobile}
                    </small>
                  </div>
                  <em>
                    {user.isDeleted
                      ? "Deleted"
                      : user.status
                        ? "Active"
                        : "Pending"}
                  </em>
                </article>
              ))}
            </div>
          </section>

          <section className="ss-dashboard-panel">
            <SectionHeading
              icon={<LuActivity />}
              title="Recent Activity"
              description="Model changes from the current preview window."
            />
            <div className="ss-dashboard-timeline">
              {activityItems.map((item) => (
                <article key={item.title}>
                  <span>{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="ss-dashboard-panel ss-dashboard-insights-card">
            <SectionHeading
              icon={<LuLineChart />}
              title="Model Insights"
              description="Simple placeholders for the future API data."
            />
            <div className="ss-dashboard-insight-list">
              <div>
                <span>Users total</span>
                <strong>{formatNumber(filteredUsers.length)}</strong>
              </div>
              <div>
                <span>Listings total</span>
                <strong>{formatNumber(filteredListings.length)}</strong>
              </div>
              <div>
                <span>Blogs total</span>
                <strong>{formatNumber(filteredBlogs.length)}</strong>
              </div>
            </div>
          </section>

          <section className="ss-dashboard-footer-widgets">
            <button type="button">
              <LuBell />
              <span>
                <strong>Announcements</strong>
                <small>Dummy dashboard is ready for API wiring.</small>
              </span>
            </button>
            <button type="button">
              <LuHeart />
              <span>
                <strong>Listings Review</strong>
                <small>Confidence and status checks are visible.</small>
              </span>
            </button>
            <button type="button">
              <LuClipboardList />
              <span>
                <strong>Blog Controls</strong>
                <small>Content and categories stay separate.</small>
              </span>
            </button>
            <button type="button">
              <LuClock3 />
              <span>
                <strong>Latest Updates</strong>
                <small>Future API responses can plug in here.</small>
              </span>
            </button>
          </section>
        </aside>
      </section>
    </div>
  );
}
