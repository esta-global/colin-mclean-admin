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
  LuBookOpen,
  LuCalendarDays,
  LuCheckCircle2,
  LuChevronDown,
  LuClock3,
  LuExternalLink,
  LuFileText,
  LuFolderTree,
  LuHome,
  LuMail,
  LuPenTool,
  LuSparkles,
  LuUserCheck,
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

type DemoPost = {
  _id: string;
  title: string;
  slug: string;
  type: "blog" | "essay";
  authorName: string;
  categoryName: string;
  excerpt: string;
  readingTime?: string;
  status: boolean;
  createdAt: string;
};

type DemoInquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "pending" | "reviewed" | "replied";
  createdAt: string;
};

const demoPosts: DemoPost[] = [
  {
    _id: "b1",
    title: "The Architecture of Financial Governance",
    slug: "architecture-financial-governance",
    type: "blog",
    authorName: "Colin McLean",
    categoryName: "Governance & Leadership",
    excerpt:
      "A systematic evaluation of corporate stewardship, fiduciary standards, and institutional oversight.",
    readingTime: "6 min read",
    status: true,
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    _id: "e1",
    title: "Capital Markets in an Era of Uncertainty",
    slug: "capital-markets-uncertainty",
    type: "essay",
    authorName: "Colin McLean",
    categoryName: "Global Economics",
    excerpt:
      "Examining long-term macroeconomic volatility, liquidity trends, and geopolitical headwinds.",
    readingTime: "12 min read",
    status: true,
    createdAt: "2026-08-04T14:30:00Z",
  },
  {
    _id: "b2",
    title: "Navigating Energy Transitions in the North Sea",
    slug: "navigating-energy-transitions",
    type: "blog",
    authorName: "Colin McLean",
    categoryName: "Energy & Infrastructure",
    excerpt:
      "Strategic perspectives on capital reallocation and sustainable modernization.",
    readingTime: "8 min read",
    status: true,
    createdAt: "2026-07-28T09:15:00Z",
  },
  {
    _id: "e2",
    title: "Philosophy of Long-Horizon Investment",
    slug: "philosophy-long-horizon-investment",
    type: "essay",
    authorName: "Colin McLean",
    categoryName: "Investment Strategy",
    excerpt:
      "The enduring principles that separate speculative momentum from disciplined intrinsic growth.",
    readingTime: "15 min read",
    status: false,
    createdAt: "2026-07-20T16:45:00Z",
  },
];

const demoInquiries: DemoInquiry[] = [
  {
    _id: "i1",
    name: "Alistair Crawford",
    email: "a.crawford@aberdeen-invest.com",
    phone: "+44 1224 554321",
    message: "Requesting Colin McLean for a keynote lecture on Scottish Financial Governance.",
    status: "pending",
    createdAt: "2026-08-12T11:20:00Z",
  },
  {
    _id: "i2",
    name: "Dr. Fiona Campbell",
    email: "fcampbell@ed.ac.uk",
    phone: "+44 131 650 1000",
    message: "Inquiry regarding academic symposium participation and guest lecture series.",
    status: "reviewed",
    createdAt: "2026-08-08T15:40:00Z",
  },
  {
    _id: "i3",
    name: "Marcus Vance",
    email: "marcus.vance@vancecapital.co.uk",
    phone: "+44 20 7946 0912",
    message: "Seeking permissions for syndication of the 'Capital Markets' essay.",
    status: "replied",
    createdAt: "2026-08-01T08:15:00Z",
  },
];

function formatNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue)
    ? numberValue.toLocaleString("en-US")
    : "0";
}

function isWithinRange(date: string, startDate: Date, endDate: Date) {
  return moment(date).isBetween(
    moment(startDate),
    moment(endDate),
    "day",
    "[]",
  );
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

function StatusBadge({ status }: { status: boolean }) {
  return (
    <span className={`ss-dashboard-status-badge ${status ? "is-active" : "is-draft"}`}>
      {status ? "Published" : "Draft"}
    </span>
  );
}

export function Home() {
  const navigate = useNavigate();

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: "selection",
  });

  const filteredPosts = demoPosts.filter((item) =>
    isWithinRange(item.createdAt, selectionRange.startDate, selectionRange.endDate),
  );
  const filteredInquiries = demoInquiries.filter((item) =>
    isWithinRange(item.createdAt, selectionRange.startDate, selectionRange.endDate),
  );

  const blogs = filteredPosts.filter((p) => p.type === "blog");
  const essays = filteredPosts.filter((p) => p.type === "essay");

  const publishedBlogs = blogs.filter((b) => b.status).length;
  const publishedEssays = essays.filter((e) => e.status).length;
  const pendingInquiries = filteredInquiries.filter((i) => i.status === "pending").length;

  const selectedRangeLabel = `${moment(selectionRange.startDate).format(
    "DD MMM YYYY",
  )} - ${moment(selectionRange.endDate).format("DD MMM YYYY")}`;

  const quickActions: QuickActionProps[] = [
    {
      title: "Write Blog",
      description: "Create and publish a new category-wise article.",
      cta: "New Blog",
      icon: <LuPenTool />,
      onClick: () => navigate("/posts/add"),
    },
    {
      title: "Write Essay",
      description: "Draft an in-depth longform research essay.",
      cta: "New Essay",
      icon: <LuBookOpen />,
      onClick: () => navigate("/essays/add"),
    },
    {
      title: "Blog Categories",
      description: "Manage taxonomy, slugs, and topics.",
      cta: "Categories",
      icon: <LuFolderTree />,
      onClick: () => navigate("/blogCategories"),
    },
    {
      title: "Contact Enquiries",
      description: "Review messages from the Colin McLean website.",
      cta: "Enquiries",
      icon: <LuMail />,
      onClick: () => navigate("/admin/contact-inquiries"),
    },
    {
      title: "Home Page Content",
      description: "Update Hero, Perspectives, and preview sections.",
      cta: "Edit Home",
      icon: <LuHome />,
      onClick: () => navigate("/homepage"),
    },
    {
      title: "About Page Content",
      description: "Manage bio, role, and portrait photograph.",
      cta: "Edit About",
      icon: <LuUserCheck />,
      onClick: () => navigate("/aboutPage"),
    },
  ];

  const stats: DashboardStatCardProps[] = [
    {
      title: "Blogs",
      value: formatNumber(blogs.length),
      description: "Published and draft blogs",
      trend: 10,
      trendLabel: `${formatNumber(publishedBlogs)} live`,
      icon: <LuFileText />,
      onClick: () => navigate("/posts"),
    },
    {
      title: "Essays",
      value: formatNumber(essays.length),
      description: "Longform thought pieces",
      trend: 5,
      trendLabel: `${formatNumber(publishedEssays)} live`,
      icon: <LuBookOpen />,
      onClick: () => navigate("/essays"),
    },
    {
      title: "Enquiries",
      value: formatNumber(filteredInquiries.length),
      description: "Contact form submissions",
      trend: 8,
      trendLabel: `${formatNumber(pendingInquiries)} pending`,
      icon: <LuMail />,
      onClick: () => navigate("/admin/contact-inquiries"),
    },
    {
      title: "Categories",
      value: "6 Active",
      description: "Categorised topics",
      trendLabel: "Taxonomy",
      icon: <LuFolderTree />,
      onClick: () => navigate("/blogCategories"),
    },
  ];

  const activityItems = [
    {
      title: "New contact enquiry received",
      meta: "Alistair Crawford requested a keynote lecture",
      icon: <LuMail />,
    },
    {
      title: "Blog published",
      meta: "The Architecture of Financial Governance is now live",
      icon: <LuFileText />,
    },
    {
      title: "Essay drafted",
      meta: "Philosophy of Long-Horizon Investment saved to drafts",
      icon: <LuBookOpen />,
    },
    {
      title: "Home page updated",
      meta: "Perspectives section and Topics updated",
      icon: <LuHome />,
    },
  ];

  return (
    <div className="content-wrapper ss-dashboard-page">
      <section className="ss-dashboard-hero">
        <div>
          <span className="ss-dashboard-eyebrow">
            <LuSparkles />
            Colin McLean Editorial Administration
          </span>
          <h1>Welcome to Colin McLean Dashboard</h1>
          <p>
            Manage Colin McLean's public editorial portal, longform essays, category-wise
            blog publications, homepage sections, biography, and reader enquiries.
          </p>
        </div>

        <div className="ss-dashboard-hero__panel">
          <div className="ss-dashboard-plan-card">
            <span>Viewing Period</span>
            <strong>{selectedRangeLabel}</strong>
            <small>Active editorial publishing window</small>
          </div>
          <div className="ss-dashboard-credit-mini">
            <span>Total Publications</span>
            <strong>{formatNumber(blogs.length + essays.length)}</strong>
          </div>
          <button
            type="button"
            className="ss-dashboard-primary-btn"
            onClick={() => navigate("/posts/add")}
          >
            <LuPenTool />
            Publish New Content
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
              rangeColors={["#ebc43d"]}
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
              description="Fast shortcuts for content creation and site management."
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
                icon={<LuFileText />}
                title="Recent Publications"
                description="Latest blogs and longform essays."
              />
              <button
                type="button"
                className="ss-dashboard-link-btn"
                onClick={() => navigate("/posts")}
              >
                View all blogs
                <LuExternalLink />
              </button>
            </div>

            {filteredPosts.length ? (
              <div className="ss-dashboard-product-grid">
                {filteredPosts.map((post) => (
                  <article
                    className="ss-dashboard-product-card"
                    key={post._id}
                  >
                    <div className="ss-dashboard-product-card__body">
                      <span>
                        {post.type.toUpperCase()} · {post.categoryName}
                      </span>
                      <h3>{post.title}</h3>
                      <div>
                        <strong>{post.authorName}</strong>
                        <small>{post.readingTime || "5 min"}</small>
                      </div>
                      <small>{post.excerpt}</small>
                    </div>
                    <div className="ss-dashboard-product-card__actions">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            post.type === "essay"
                              ? `/essays/edit/${post._id}`
                              : `/posts/edit/${post._id}`,
                          )
                        }
                      >
                        Edit Article
                      </button>
                      <StatusBadge status={post.status} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ss-dashboard-empty-state">
                <LuFileText />
                <strong>No publications in this range</strong>
                <p>Create a blog or essay to see it here.</p>
                <button type="button" onClick={() => navigate("/posts/add")}>
                  New Blog Post
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="ss-dashboard-side-column">
          <section className="ss-dashboard-panel">
            <div className="ss-dashboard-panel__top">
              <SectionHeading
                icon={<LuMail />}
                title="Recent Enquiries"
                description="Inquiries submitted from website contact form."
              />
              <button
                type="button"
                className="ss-dashboard-link-btn"
                onClick={() => navigate("/admin/contact-inquiries")}
              >
                All Enquiries
                <LuExternalLink />
              </button>
            </div>
            <div className="ss-dashboard-timeline">
              {filteredInquiries.map((inq) => (
                <article key={inq._id}>
                  <span>{inq.name.slice(0, 1)}</span>
                  <div>
                    <strong>{inq.name}</strong>
                    <small>{inq.email} · {inq.phone}</small>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-muted)" }}>
                      {inq.message}
                    </p>
                  </div>
                  <em className={`ss-inquiry-pill ss-inquiry-pill--${inq.status}`}>{inq.status}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="ss-dashboard-panel">
            <SectionHeading
              icon={<LuActivity />}
              title="Recent Activity"
              description="Editorial and page management updates."
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
        </aside>
      </section>
    </div>
  );
}
