import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
      <Route path="/" element={<Pages.Home />} />
      <Route path="/login" element={<Pages.Login />} />
      <Route path="/forgot-password" element={<Pages.ForgotPassword />} />
      <Route path="/verify-otp" element={<Pages.VerifyOtp />} />
      <Route
        path="/create-new-password"
        element={<Pages.CreateNewPassword />}
      />
      {/* Media */}
      <Route path="/media/add" element={<Pages.AddMedia />} />
      {/* <Route path="/categories/edit/:id" element={<Pages.EditCategory />} /> */}
      <Route path="/media" element={<Pages.MediaList />} />
      {/* Category */}
      <Route path="/categories/add" element={<Pages.AddCategory />} />
      <Route path="/categories/edit/:id" element={<Pages.EditCategory />} />
      <Route path="/categories" element={<Pages.CategoryList />} />
      {/* Gallery Image */}
      <Route path="/galleryImages/add" element={<Pages.AddGalleryImage />} />
      <Route
        path="/galleryImages/edit/:id"
        element={<Pages.EditGalleryImage />}
      />
      <Route path="/galleryImages" element={<Pages.GalleryImageList />} />
      {/* Carousel */}
      <Route path="/carousels/add" element={<Pages.AddCarousel />} />
      <Route path="/carousels/edit/:id" element={<Pages.EditCarousel />} />
      <Route path="/carousels" element={<Pages.CarouselList />} />
      {/* Category Showcase */}
      <Route
        path="/categoryShowcase/add"
        element={<Pages.AddCategoryShowcase />}
      />
      <Route
        path="/categoryShowcase/edit/:id"
        element={<Pages.EditCategoryShowcase />}
      />
      <Route
        path="/categoryShowcase"
        element={<Pages.CategoryShowcaseList />}
      />
      {/* Blog Page */}
      <Route path="/blogpage" element={<Pages.BlogPageContent />} />
      {/* Privacy Policy Page */}
      <Route
        path="/privacypolicy"
        element={<Pages.PrivacyPolicyPageContent />}
      />
      <Route
        path="/termandconditions"
        element={<Pages.TermAndConditionspage />}
      />
      {/* About Page */}
      <Route path="/aboutpage" element={<Pages.AboutPageContent />} />
      <Route
        path="/executive-council-page"
        element={<Pages.ExecutiveCouncilPageContent />}
      />
      <Route
        path="/executive-council-members"
        element={<Pages.ExecutiveCouncilMembersContent />}
      />
      <Route
        path="/past-chairmen-page"
        element={<Pages.PastChairmenPageContent />}
      />
      <Route
        path="/sub-committees-page"
        element={<Pages.SubCommitteesPageContent />}
      />
      <Route
        path="/industry-details-page"
        element={<Pages.IndustryDetailsPageContent />}
      />
      <Route
        path="/report-page"
        element={<Pages.ReportPageContent />}
      />
      <Route
        path="/member-list/:kind"
        element={<Pages.MemberListPageContent />}
      />
      <Route
        path="/govt-policies/:slug"
        element={<Pages.GovtPolicyPageContent />}
      />
      <Route path="/homepage" element={<Pages.HomepageContent />} />
      <Route path="/contactpage" element={<Pages.ContactPageContent />} />
      <Route path="/admin/contact-page" element={<Pages.ContactPageContent />} />

      {/* Sub Category */}
      <Route path="/subCategories/add" element={<Pages.AddSubCategory />} />
      <Route
        path="/subCategories/edit/:id"
        element={<Pages.EditSubCategory />}
      />
      <Route path="/subCategories" element={<Pages.SubCategoryList />} />
      {/* Newsletters */}
      <Route path="/newsletters/add" element={<Pages.AddNewsletter />} />
      <Route path="/newsletters/edit/:id" element={<Pages.EditNewsletter />} />
      <Route path="/newsletters" element={<Pages.NewsletterList />} />

      {/* Coupons */}
      <Route path="/coupons/add" element={<Pages.AddCoupon />} />
      <Route path="/coupons/edit/:id" element={<Pages.EditCoupon />} />
      <Route path="/coupons" element={<Pages.CouponList />} />

      {/* Users */}
      <Route path="/users/add" element={<Pages.AddUser />} />
      <Route path="/users/edit/:id" element={<Pages.EditUser />} />
      <Route path="/users" element={<Pages.UserList />} />
      <Route path="/users/details/:id" element={<Pages.UserDetails />} />

      {/* Sizes */}
      <Route path="/sizes/add" element={<Pages.AddSize />} />
      <Route path="/sizes/edit/:id" element={<Pages.EditSize />} />
      <Route path="/sizes" element={<Pages.SizeList />} />

      {/* Shapes */}
      <Route path="/shapes/add" element={<Pages.AddShape />} />
      <Route path="/shapes/edit/:id" element={<Pages.EditShape />} />
      <Route path="/shapes" element={<Pages.ShapeList />} />

      {/* Materials */}
      <Route path="/materials/add" element={<Pages.AddMaterial />} />
      <Route path="/materials/edit/:id" element={<Pages.EditMaterial />} />
      <Route path="/materials" element={<Pages.MaterialList />} />

      {/* Thickness */}
      <Route path="/thickness/add" element={<Pages.AddThickness />} />
      <Route path="/thickness/edit/:id" element={<Pages.EditThickness />} />
      <Route path="/thickness" element={<Pages.ThicknessList />} />

      {/* Badge */}
      <Route path="/badges/add" element={<Pages.AddBadge />} />
      <Route path="/badges/edit/:id" element={<Pages.EditBadge />} />
      <Route path="/badges" element={<Pages.BadgeList />} />

      {/* Badge */}
      <Route path="/badgesgit/add" element={<Pages.AddBadge />} />
      <Route path="/badgesgit/edit/:id" element={<Pages.EditBadge />} />
      <Route path="/badgesgit" element={<Pages.BadgeList />} />

      {/* Colors */}
      <Route path="/colors/add" element={<Pages.AddColor />} />
      <Route path="/colors/edit/:id" element={<Pages.EditColor />} />
      <Route path="/colors" element={<Pages.ColorList />} />

      {/* Gallery category */}
      <Route
        path="/galleryCategories/add"
        element={<Pages.AddGalleryCategory />}
      />
      <Route
        path="/galleryCategories/edit/:id"
        element={<Pages.EditGalleryCategory />}
      />
      <Route
        path="/galleryCategories"
        element={<Pages.GalleryCategoryList />}
      />
      <Route path="/gallerypage" element={<Pages.GalleryPageContent />} />
      <Route
        path="/certificatepage"
        element={<Pages.CertificatePageContent />}
      />
      <Route
        path="/sustainabilityPage"
        element={<Pages.SustainabilityPageContent />}
      />

      {/* Faqs category */}
      <Route path="/faqsCategory/add" element={<Pages.AddFaqCategory />} />
      <Route
        path="/faqsCategory/edit/:id"
        element={<Pages.EditFaqCategory />}
      />
      <Route path="/faqsCategory" element={<Pages.FaqCategoryList />} />

      {/* Faqs */}
      <Route path="/faqs/add" element={<Pages.AddFaqs />} />
      <Route path="/faqs/edit/:id" element={<Pages.EditFaqs />} />
      <Route path="/faqs" element={<Pages.FaqsList />} />

      <Route path="/resourcePage" element={<Pages.ResourcePageContent />} />

      {/* Posts */}
      <Route path="/blogCategories/add" element={<Pages.AddBlogCategory />} />
      <Route
        path="/blogCategories/edit/:id"
        element={<Pages.EditBlogCategory />}
      />
      <Route path="/blogCategories" element={<Pages.BlogCategoryList />} />
      {/* Marketplace */}
      <Route path="/marketplaces/add" element={<Pages.AddMarketplace />} />
      <Route
        path="/marketplaces/edit/:id"
        element={<Pages.EditMarketplace />}
      />
      <Route path="/marketplaces" element={<Pages.MarketplaceList />} />
      {/* Authors */}
      <Route path="/authors/add" element={<Pages.AddAuthor />} />
      <Route path="/authors/edit/:id" element={<Pages.EditAuthor />} />
      <Route path="/authors" element={<Pages.AuthorList />} />
      {/* Posts */}
      <Route path="/posts/add" element={<Pages.AddPost />} />
      <Route path="/posts/details/:id" element={<Pages.PostDetails />} />
      <Route path="/posts/edit/:id" element={<Pages.EditPost />} />
      <Route path="/posts" element={<Pages.PostList />} />
      {/* Promotion Text */}
      <Route path="/promotionTexts/add" element={<Pages.AddPromotionText />} />
      <Route
        path="/promotionTexts/edit/:id"
        element={<Pages.EditPromotionText />}
      />
      <Route path="/promotionTexts" element={<Pages.PromotionTextList />} />

      {/* Features */}
      <Route path="/features/add" element={<Pages.AddFeatures />} />
      <Route path="/features/edit/:id" element={<Pages.EditFeatures />} />
      <Route path="/features" element={<Pages.FeaturesList />} />

      {/* Certifications */}
      <Route path="/certifications/add" element={<Pages.AddCertifications />} />
      <Route
        path="/certifications/edit/:id"
        element={<Pages.EditCertifications />}
      />
      <Route path="/certifications" element={<Pages.CertificationsList />} />

      {/* Edges */}
      <Route path="/edges/add" element={<Pages.AddEdge />} />
      <Route path="/edges/edit/:id" element={<Pages.EditEdge />} />
      <Route path="/edges" element={<Pages.EdgeList />} />
      {/* Types */}
      <Route path="/decorSeries/add" element={<Pages.AddDecorSeries />} />
      <Route path="/decorSeries/edit/:id" element={<Pages.EditDecorSeries />} />
      <Route path="/decorSeries" element={<Pages.DecorSeriesList />} />
      {/* Orders */}
      <Route path="/orders/edit/:id" element={<Pages.EditOrder />} />
      <Route path="/orders" element={<Pages.OrderList />} />
      <Route path="/orders/falseOrders" element={<Pages.FalseOrderList />} />
      <Route path="/orders/details/:id" element={<Pages.OrderDetails />} />

      {/* Wishlists */}
      <Route
        path="/wishlists/details/:id"
        element={<Pages.WishlistDetails />}
      />
      <Route path="/wishlists" element={<Pages.Wishlist />} />

      {/* Inquiries */}
      <Route path="/inquiries/add" element={<Pages.AddInquiry />} />
      <Route path="/inquiries/edit/:id" element={<Pages.EditInquiry />} />
      <Route path="/inquiries" element={<Pages.InquiryList />} />
      <Route path="/inquiries/details/:id" element={<Pages.InquiryDetails />} />
      <Route
        path="/admin/contact-inquiries"
        element={<Pages.ContactInquiryList />}
      />
      <Route
        path="/admin/contact-inquiries/details/:id"
        element={<Pages.ContactInquiryDetails />}
      />
      <Route
        path="/admin/contact-inquiries/edit/:id"
        element={<Pages.EditContactInquiry />}
      />

      {/* Notify Me */}
      <Route path="/notifyMe/add" element={<Pages.AddNotifyMe />} />
      <Route path="/notifyMe/details/:id" element={<Pages.ViewNotifyMe />} />
      <Route path="/notifyMe/edit/:id" element={<Pages.EditNotifyMe />} />
      <Route path="/notifyMe" element={<Pages.NotifyMeList />} />

      {/* Product Reviews */}
      <Route path="/productReviews/add" element={<Pages.AddReview />} />
      <Route path="/productReviews/edit/:id" element={<Pages.EditReview />} />
      <Route path="/productReviews" element={<Pages.ReviewList />} />

      {/* Products */}
      <Route path="/products/add" element={<Pages.AddProduct />} />
      {/* <Route path="/products/add" element={<Pages.AddProduct />} /> */}
      <Route path="/products/addViaCsv" element={<Pages.AddProductViaCSV />} />
      <Route
        path="/products/edit/:id/:page?"
        element={<Pages.EditProductNew />}
      />
      <Route path="/products" element={<Pages.ProductList />} />
      <Route path="/products/details/:id" element={<Pages.ProductDetails />} />
      {/* Listings */}
      <Route path="/listings" element={<Pages.ListingList />} />
      <Route path="/listings/details/:id" element={<Pages.ListingDetails />} />
      {/* File Details */}
      <Route path="/fileDetails/:fileName" element={<Pages.ViewFile />} />
    </Routes>
    </>
  );
}
