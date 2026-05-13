import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Banner from "./components/banner/Banner";
import ArticlesSection from "./components/articles/ArticlesSection";
import WorkSection from "./components/work/WorkSection";
import Reviews from "./components/reviews/ReviewsSection";
import OffersSection from "./components/offers/OffersSection";

// Pages
import AboutUs from "./Pages/AboutUs";
import Contacts from "./Pages/Contacts";
import Experts from "./Pages/Experts";
import KnowledgeBase from "./Pages/KnowledgeBase";
import AdminPanel from "./Pages/AdminPanel";
import AdminRoute from "./components/auth/AdminRoute";
import AuthLayout from "./components/auth/AuthLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import RecoveryEmailPage from "./Pages/RecoveryEmailPage";
import RecoveryCodePage from "./Pages/RecoveryCodePage";
import RecoveryNewPasswordPage from "./Pages/RecoveryNewPasswordPage";
import ProfilePage from "./Pages/ProfilePage";
import ArticlePage from "./Pages/ArticlePage";
import TermsConditions from "./components/footer-components/TermsConditions";
import Legal from "./components/footer-components/Legal";
import Certification from "./components/footer-components/Certification";
import ReviewsPage from "./components/footer-components/Reviews";

function HomePage()
{
    return (
        <>
            <Banner />
            <ArticlesSection />
            <WorkSection />
            <Reviews />
            <OffersSection />
        </>
    );
}

function App()
{
    return (
        <Routes>
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminPanel />
                    </AdminRoute>
                }
            />

            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/password-recovery" element={<RecoveryEmailPage />} />
                <Route path="/password-recovery/code" element={<RecoveryCodePage />} />
                <Route path="/password-recovery/new" element={<RecoveryNewPasswordPage />} />
            </Route>

            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/knowledge" element={<KnowledgeBase />} />
                <Route path="/experts" element={<Experts />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/article/:slug" element={<ArticlePage />} />

                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/certification" element={<Certification />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;