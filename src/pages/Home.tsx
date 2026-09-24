import { useEffect, useState } from "react";
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
  LuChevronDown,
  LuExternalLink,
  LuFileText,
  LuFolderTree,
  LuHome,
  LuMail,
  LuPenTool,
  LuSparkles,
  LuUserCheck,
} from "react-icons/lu";
import { get } from "../utills";
import { OverlayLoading } from "../components";

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

type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  time: string;
  date: string;
  icon: ReactNode;
  onClick?: () => void;
};

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

  const [loading, setLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [homepageInfo, setHomepageInfo] = useState<any>(null);
  const [aboutPageInfo, setAboutPageInfo] = useState<any>(null);

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: "selection",
  });

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [postsRes, inquiriesRes, categoriesRes, homepageRes, aboutRes] =
          await Promise.allSettled([
            get("/blogs?limit=100&sort=newest", true),
            get("/contact-inquiries?limit=50&sort=newest", true),
            get("/blogCategories?limit=100", true),
            get("/homepage", true),
            get("/aboutPage", true),
          ]);

        if (postsRes.status === "fulfilled" && postsRes.value?.status === 200) {
          const list = Array.isArray(postsRes.value.body) ? postsRes.value.body : [];
          setPosts(list);
        }

        if (inquiriesRes.status === "fulfilled" && inquiriesRes.value?.status === 200) {
          const body = inquiriesRes.value.body || {};
          const list = Array.isArray(body.items)
            ? body.items
            : Array.isArray(body)
            ? body
            : [];
          setInquiries(list);
        }

        if (categoriesRes.status === "fulfilled" && categoriesRes.value?.status === 200) {
          const list = Array.isArray(categoriesRes.value.body) ? categoriesRes.value.body : [];
          setCategories(list);
        }

        if (homepageRes.status === "fulfilled" && homepageRes.value?.status === 200) {
          setHomepageInfo(homepageRes.value.body);
        }

        if (aboutRes.status === "fulfilled" && aboutRes.value?.status === 200) {
          setAboutPageInfo(aboutRes.value.body);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const filteredPosts = posts.filter((item) =>
    item.createdAt
      ? isWithinRange(item.createdAt, selectionRange.startDate, selectionRange.endDate)
      : true
  );

  const filteredInquiries = inquiries.filter((item) =>
    item.createdAt
      ? isWithinRange(item.createdAt, selectionRange.startDate, selectionRange.endDate)
      : true
  );

  const blogs = posts.filter((p) => (p.type || "blog") === "blog");
  const essays = posts.filter((p) => p.type === "essay");

  const publishedBlogs = blogs.filter((b) => b.status).length;
  const publishedEssays = essays.filter((e) => e.status).length;
  const pendingInquiries = inquiries.filter(
    (i) => (i.status || "pending") === "pending"
  ).length;
  const activeCategoriesCount = categories.filter((c) => c.status !== false).length;

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
      onClick: () => navigate("/posts/add"),
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
      onClick: () => navigate("/aboutpage"),
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
      onClick: () => navigate("/posts"),
    },
    {
      title: "Enquiries",
      value: formatNumber(inquiries.length),
      description: "Contact form submissions",
      trend: 8,
      trendLabel: `${formatNumber(pendingInquiries)} pending`,
      icon: <LuMail />,
      onClick: () => navigate("/admin/contact-inquiries"),
    },
    {
      title: "Categories",
      value: `${activeCategoriesCount} Active`,
      description: "Categorised topics",
      trendLabel: `${categories.length} total`,
      icon: <LuFolderTree />,
      onClick: () => navigate("/blogCategories"),
    },
  ];

  // Dynamic Recent Activities synthesized from real events
  const activityItems: ActivityItem[] = [];

  // Recent posts activities
  posts.slice(0, 6).forEach((post) => {
    const isEssay = post.type === "essay";
    const isPub = Boolean(post.status);
    activityItems.push({
      id: `post-${post._id || post.id}`,
      title: `${isEssay ? "Essay" : "Blog"} ${isPub ? "published" : "drafted"}`,
      meta: post.title || "Untitled article",
      date: post.createdAt || post.updatedAt || new Date().toISOString(),
      time: post.createdAt ? moment(post.createdAt).fromNow() : "Recently",
      icon: isEssay ? <LuBookOpen /> : <LuFileText />,
      onClick: () => navigate(`/posts/edit/${post._id || post.id}`),
    });
  });

  // Recent inquiries activities
  inquiries.slice(0, 5).forEach((inq) => {
    const name = inq.name || inq.fullName || "Reader";
    activityItems.push({
      id: `inq-${inq._id || inq.id}`,
      title: "New contact enquiry received",
      meta: `${name}${inq.subject ? `: ${inq.subject}` : inq.message ? `: ${inq.message.slice(0, 50)}...` : ""}`,
      date: inq.createdAt || new Date().toISOString(),
      time: inq.createdAt ? moment(inq.createdAt).fromNow() : "Recently",
      icon: <LuMail />,
      onClick: () => navigate("/admin/contact-inquiries"),
    });
  });

  // Homepage update activity
  if (homepageInfo?.updatedAt) {
    activityItems.push({
      id: "activity-homepage",
      title: "Home page updated",
      meta: "Perspectives, topics and homepage sections updated",
      date: homepageInfo.updatedAt,
      time: moment(homepageInfo.updatedAt).fromNow(),
      icon: <LuHome />,
      onClick: () => navigate("/homepage"),
    });
  }

  // About page update activity
  if (aboutPageInfo?.updatedAt) {
    activityItems.push({
      id: "activity-aboutpage",
      title: "About page updated",
      meta: "Colin McLean profile, biography and role updated",
      date: aboutPageInfo.updatedAt,
      time: moment(aboutPageInfo.updatedAt).fromNow(),
      icon: <LuUserCheck />,
      onClick: () => navigate("/aboutpage"),
    });
  }

  // Sort activities by date descending and take top 6
  activityItems.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const displayActivities = activityItems.slice(0, 6);

  // Recent Publications to display (up to 6)
  const displayPosts = filteredPosts.length ? filteredPosts.slice(0, 6) : posts.slice(0, 6);

  return (
    <div className="content-wrapper ss-dashboard-page">
      <OverlayLoading loading={loading} />

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
            <strong>{formatNumber(posts.length)}</strong>
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

            {displayPosts.length ? (
              <div className="ss-dashboard-product-grid">
                {displayPosts.map((post) => {
                  const categoryName =
                    post.category?.name || post.categoryName || "General";
                  const authorName =
                    post.author?.name || post.authorName || "Colin McLean";
                  const readingTime = post.readingTime || "5 min read";
                  const excerpt =
                    post.excerpt || post.description || "No excerpt provided.";
                  const postId = post._id || post.id;
                  const typeLabel = (post.type || "blog").toUpperCase();

                  return (
                    <article
                      className="ss-dashboard-product-card"
                      key={postId}
                    >
                      <div className="ss-dashboard-product-card__body">
                        <span>
                          {typeLabel} · {categoryName}
                        </span>
                        <h3>{post.title}</h3>
                        <div>
                          <strong>{authorName}</strong>
                          <small>{readingTime}</small>
                        </div>
                        <small className="line-clamp-2">{excerpt}</small>
                      </div>
                      <div className="ss-dashboard-product-card__actions">
                        <button
                          type="button"
                          onClick={() => navigate(`/posts/edit/${postId}`)}
                        >
                          Edit Article
                        </button>
                        <StatusBadge status={Boolean(post.status)} />
                      </div>
                    </article>
                  );
                })}
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
              {filteredInquiries.length ? (
                filteredInquiries.slice(0, 5).map((inq) => {
                  const displayName = inq.name || inq.fullName || "Anonymous";
                  const initial = displayName.slice(0, 1).toUpperCase();
                  const status = inq.status || "pending";
                  const inqId = inq._id || inq.id;

                  return (
                    <article
                      key={inqId}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/admin/contact-inquiries")}
                    >
                      <span>{initial}</span>
                      <div>
                        <strong>{displayName}</strong>
                        <small>
                          {inq.email || "No email"} {inq.phone ? `· ${inq.phone}` : ""}
                        </small>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "12px",
                            color: "var(--color-muted)",
                          }}
                        >
                          {inq.message || inq.subject || "No message content"}
                        </p>
                        <small
                          style={{
                            color: "var(--cm-muted-ink, #888)",
                            fontSize: "11px",
                            marginTop: "3px",
                            display: "block",
                          }}
                        >
                          {inq.createdAt ? moment(inq.createdAt).fromNow() : ""}
                        </small>
                      </div>
                      <em className={`ss-inquiry-pill ss-inquiry-pill--${status}`}>
                        {status}
                      </em>
                    </article>
                  );
                })
              ) : (
                <div className="p-3 text-muted text-center">
                  <small>No enquiries found in this period.</small>
                </div>
              )}
            </div>
          </section>

          <section className="ss-dashboard-panel">
            <SectionHeading
              icon={<LuActivity />}
              title="Recent Activity"
              description="Editorial and page management updates."
            />
            <div className="ss-dashboard-timeline">
              {displayActivities.length ? (
                displayActivities.map((item) => (
                  <article
                    key={item.id}
                    style={{ cursor: item.onClick ? "pointer" : "default" }}
                    onClick={item.onClick}
                  >
                    <span>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <strong style={{ fontSize: "13px" }}>{item.title}</strong>
                        <small
                          style={{
                            fontSize: "11px",
                            color: "var(--cm-muted-ink, #888)",
                            whiteSpace: "nowrap",
                            marginLeft: "6px",
                          }}
                        >
                          {item.time}
                        </small>
                      </div>
                      <small
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "230px",
                          color: "var(--cm-muted-ink, #666)",
                          marginTop: "2px",
                        }}
                      >
                        {item.meta}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="p-3 text-muted text-center">
                  <small>No recent activity yet.</small>
                </div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
