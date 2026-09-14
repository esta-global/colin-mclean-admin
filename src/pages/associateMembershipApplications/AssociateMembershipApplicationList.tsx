import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../../utills";

type Application = { _id: string; companyDetails?: { companyName?: string; companyEmail?: string; category?: string }; nominee?: { nomineeName?: string }; status?: string; createdAt?: string };
export function AssociateMembershipApplicationList() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { const response = await get("/associate-membership-applications?page=1&limit=100", true); setItems(response?.status === 200 ? response.body?.items || [] : []); setLoading(false); })(); }, []);
  return <div className="content-wrapper marketplace-admin-page"><div className="about-page-admin__header"><div><span className="about-page-admin__eyebrow">Applications</span><h1>Associate Membership Applications</h1><p>Review applications submitted from the Associate Membership Form.</p></div></div><div className="card"><div className="card-body"><div className="table-responsive"><table className="table"><thead><tr><th>Company</th><th>Email</th><th>Nominee</th><th>Category</th><th>Status</th><th>Submitted</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan={7}>Loading...</td></tr> : items.map((item) => <tr key={item._id}><td>{item.companyDetails?.companyName || "-"}</td><td>{item.companyDetails?.companyEmail || "-"}</td><td>{item.nominee?.nomineeName || "-"}</td><td>{item.companyDetails?.category || "-"}</td><td>{item.status || "New"}</td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</td><td><Link className="btn btn-sm btn-primary" to={`/associate-membership-applications/details/${item._id}`}>View</Link></td></tr>)}</tbody></table>{!loading && !items.length ? <p className="text-muted">No applications found.</p> : null}</div></div></div></div>;
}
