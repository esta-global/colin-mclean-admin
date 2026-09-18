import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import * as Pages from "../../pages";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function Router() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Dashboard & Auth */}
        <Route path="/" element={<Pages.Home />} />
        <Route path="/login" element={<Pages.Login />} />
        <Route path="/forgot-password" element={<Pages.ForgotPassword />} />
        <Route path="/verify-otp" element={<Pages.VerifyOtp />} />
        <Route path="/create-new-password" element={<Pages.CreateNewPassword />} />

        {/* Blog Management */}
        <Route path="/posts" element={<Pages.PostList key="blogs" defaultType="blog" />} />
        <Route path="/posts/add" element={<Pages.AddPost defaultType="blog" />} />
        <Route path="/posts/details/:id" element={<Pages.PostDetails defaultType="blog" />} />
        <Route path="/posts/edit/:id" element={<Pages.EditPost defaultType="blog" />} />

        {/* Essay routes redirected to blogs */}
        <Route path="/essays" element={<Navigate to="/posts" replace />} />
        <Route path="/essays/add" element={<Navigate to="/posts/add" replace />} />
        <Route path="/essays/*" element={<Navigate to="/posts" replace />} />

        {/* Blog Categories */}
        <Route path="/blogCategories" element={<Pages.BlogCategoryList />} />
        <Route path="/blogCategories/add" element={<Pages.AddBlogCategory />} />
        <Route path="/blogCategories/edit/:id" element={<Pages.EditBlogCategory />} />

        {/* Pages Management */}
        <Route path="/homepage" element={<Pages.HomepageContent />} />
        <Route path="/aboutpage" element={<Pages.AboutPageContent />} />

        {/* Contact Inquiries */}
        <Route path="/admin/contact-inquiries" element={<Pages.ContactInquiryList />} />
        <Route path="/contact-inquiries" element={<Pages.ContactInquiryList />} />
        <Route path="/admin/contact-inquiries/details/:id" element={<Pages.ContactInquiryDetails />} />
        <Route path="/admin/contact-inquiries/edit/:id" element={<Pages.EditContactInquiry />} />

        {/* Media */}
        <Route path="/media" element={<Pages.MediaList />} />
        <Route path="/media/add" element={<Pages.AddMedia />} />
      </Routes>
    </>
  );
}
