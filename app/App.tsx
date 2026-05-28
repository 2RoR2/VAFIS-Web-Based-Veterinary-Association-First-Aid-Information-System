import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { AdminHeader } from './components/layout/AdminHeader';
import { VetHeader } from './components/layout/VetHeader';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { EmergencyPage } from './pages/EmergencyPage';
import { GuidePage } from './pages/GuidePage';
import { VideoPage, VideoPlayerPage } from './pages/VideoPage';
import { QuizPage } from './pages/QuizPage';
import { ClinicsPage } from './pages/ClinicsPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage, AuthUser, UserRole } from './pages/AuthPage';
import { authLogout, authMe, authRefresh, setSessionExpiredHandler } from './services/api';
import { FeedbackPage } from './pages/FeedbackPage';
import { PrivacyPage, TermsPage } from './pages/PolicyPages';
import { ReviewQueuePage } from './pages/vet_professional/reviewqueue';
import { VetReviewGuidePage } from './pages/vet_professional/reviewguide';
import { ReviewHistoryPage } from './pages/vet_professional/reviewhistory';
import { VetVideoListPage, VetEditVideoPage } from './pages/vet_professional/videomanagement';
import { VetProfilePage } from './pages/vet_professional/vet_profile';
import { PetOwnerProfilePage } from './pages/pet_owner/PetOwnerProfile';
import { ManageGuideListPage } from './pages/vet_admin/manageguide';
import { CreateGuidePage } from './pages/vet_admin/CreateGuide';
import { EditGuidePage } from './pages/vet_admin/EditGuide';
import { GuideDetailPage } from './pages/vet_admin/GuideDetail';
import { ApproveGuidePage } from './pages/vet_admin/ApproveGuide';
import { ManageVideoListPage } from './pages/vet_admin/managevideo';
import { AddEditVideoPage } from './pages/vet_admin/AddEditVideo';
import {
  AdminWorkflowDashboard,
  AuditLogPage,
  LogoutPage,
  ManageClinicPage,
  ManageGuidePage,
  ManageQuizPage,
  NotificationsPage,
  PetOwnerDashboard,
  PetProfilePage,
  ProfessionalDashboard,
  SpeciesPage,
} from './pages/WorkflowPages';

type PageType =
  | 'home'
  | 'emergency'
  | 'guide'
  | 'videos'
  | 'video'
  | 'quiz'
  | 'clinics'
  | 'feedback'
  | 'admin'
  | 'admin-workflow'
  | 'login'
  | 'signup'
  | 'search'
  | 'species'
  | 'pet-dashboard'
  | 'pet-profile'
  | 'manage-guide'
  | 'manage-quiz'
  | 'manage-clinic'
  | 'professional-dashboard'
  | 'review-guide'
  | 'notifications'
  | 'audit-log'
  | 'logout'
  | 'terms'
  | 'privacy'
  | 'admin-guide-list'
  | 'admin-guide-create'
  | 'admin-guide-edit'
  | 'admin-guide-detail'
  | 'admin-guide-approve'
  | 'admin-video-list'
  | 'admin-video-add'
  | 'admin-video-edit'
  | 'vet-review-queue'
  | 'vet-review-history'
  | 'vet-videos'
  | 'vet-video-edit'
  | 'vet-profile'
  | 'pet-owner-profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [pageData, setPageData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // When BOTH the access token and refresh token are expired, the API layer
    // calls this handler to clear React state and send the user to login.
    setSessionExpiredHandler(() => {
      setCurrentUser(null);
      setCurrentPage('login');
      setPageData(null);
      window.scrollTo(0, 0);
    });

    const restoreSession = async () => {
      let user = await authMe();

      if (!user) {
        user = await authRefresh();
      }

      if (user) {
        setCurrentUser({ name: user.fullName, email: user.email, role: user.role as UserRole });
      }
    };

    restoreSession();
  }, []);

  const handleNavigate = (page: string, data?: any) => {
    const staffPages = [
      'admin',
      'admin-workflow',
      'manage-guide',
      'manage-quiz',
      'manage-clinic',
      'professional-dashboard',
      'review-guide',
      'notifications',
      'audit-log',
      'admin-guide-list',
      'admin-guide-create',
      'admin-guide-edit',
      'admin-guide-detail',
      'admin-guide-approve',
      'admin-video-list',
      'admin-video-add',
      'admin-video-edit',
      'vet-review-queue',
      'vet-review-history',
      'vet-videos',
      'vet-video-edit',
      'vet-profile',
    ];

    if (staffPages.includes(page) && (!currentUser || currentUser.role === 'pet-owner')) {
      setCurrentPage('login');
      setPageData({ requestedPage: page, requestedData: data });
      window.scrollTo(0, 0);
      return;
    }

    setCurrentPage(page as PageType);
    setPageData(data || null);
    window.scrollTo(0, 0);
  };

  const handleUserUpdate = (user: AuthUser) => setCurrentUser(user);

  const handleLogout = () => {
    authLogout().catch(() => {});
    setCurrentUser(null);
    setCurrentPage('home');
    setPageData(null);
    window.scrollTo(0, 0);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    const requestedPage = pageData?.requestedPage;
    const requestedData = pageData?.requestedData;

    if (requestedPage && user.role !== 'pet-owner') {
      setCurrentPage(requestedPage as PageType);
      setPageData(requestedData || null);
      window.scrollTo(0, 0);
      return;
    }

    if (user.role === 'pet-owner') {
      setCurrentPage('pet-dashboard');
      setPageData(null);
      window.scrollTo(0, 0);
      return;
    }

    setCurrentPage(user.role === 'veterinary-professional' ? 'professional-dashboard' : 'admin-workflow');
    setPageData(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {currentUser?.role === 'administrator' ? (
        <AdminHeader onNavigate={handleNavigate} currentPage={currentPage} currentUser={currentUser} onLogout={handleLogout} />
      ) : currentUser?.role === 'veterinary-professional' ? (
        <VetHeader onNavigate={handleNavigate} currentPage={currentPage} currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <Header onNavigate={handleNavigate} currentPage={currentPage} currentUser={currentUser} onLogout={handleLogout} />
      )}

      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'emergency' && <EmergencyPage onNavigate={handleNavigate} />}
        {currentPage === 'guide' && <GuidePage guideId={pageData?.guideId || 'choking-emergency'} onNavigate={handleNavigate} />}
        {currentPage === 'videos' && <VideoPage onNavigate={handleNavigate} />}
        {currentPage === 'video' && <VideoPlayerPage videoId={pageData?.videoId || ''} onNavigate={handleNavigate} />}
        {currentPage === 'quiz' && <QuizPage onNavigate={handleNavigate} currentUser={currentUser} />}
        {currentPage === 'clinics' && <ClinicsPage onNavigate={handleNavigate} />}
        {currentPage === 'feedback' && <FeedbackPage onNavigate={handleNavigate} contentType={pageData?.contentType} contentTitle={pageData?.contentTitle} currentUser={currentUser} />}
        {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-workflow' && <AdminWorkflowDashboard onNavigate={handleNavigate} />}
        {currentPage === 'login' && <AuthPage mode="login" onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />}
        {currentPage === 'signup' && <AuthPage mode="signup" onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />}
        {currentPage === 'search' && <EmergencyPage onNavigate={handleNavigate} initialSpecies={pageData?.species} initialSearch={pageData?.search} />}
        {currentPage === 'species' && <SpeciesPage onNavigate={handleNavigate} species={pageData?.species || 'Dogs'} />}
        {currentPage === 'pet-dashboard' && <PetOwnerDashboard onNavigate={handleNavigate} />}
        {currentPage === 'pet-profile' && <PetProfilePage onNavigate={handleNavigate} />}
        {currentPage === 'pet-owner-profile' && <PetOwnerProfilePage onNavigate={handleNavigate} currentUser={currentUser} onUserUpdate={handleUserUpdate} />}
        {currentPage === 'manage-guide' && <ManageGuidePage onNavigate={handleNavigate} />}
        {currentPage === 'manage-quiz' && <ManageQuizPage onNavigate={handleNavigate} />}
        {currentPage === 'manage-clinic' && <ManageClinicPage onNavigate={handleNavigate} />}
        {currentPage === 'professional-dashboard' && <ProfessionalDashboard onNavigate={handleNavigate} />}
        {currentPage === 'vet-review-queue' && <ReviewQueuePage onNavigate={handleNavigate} />}
        {currentPage === 'vet-review-history' && <ReviewHistoryPage onNavigate={handleNavigate} currentUser={currentUser} />}
        {currentPage === 'vet-videos' && <VetVideoListPage onNavigate={handleNavigate} currentUser={currentUser} />}
        {currentPage === 'vet-video-edit' && <VetEditVideoPage onNavigate={handleNavigate} videoId={pageData?.videoId} />}
        {currentPage === 'vet-profile' && <VetProfilePage onNavigate={handleNavigate} currentUser={currentUser} onUserUpdate={handleUserUpdate} />}
        {currentPage === 'review-guide' && <VetReviewGuidePage onNavigate={handleNavigate} guideId={pageData?.guideId} />}
        {currentPage === 'notifications' && <NotificationsPage onNavigate={handleNavigate} />}
        {currentPage === 'audit-log' && <AuditLogPage onNavigate={handleNavigate} />}
        {currentPage === 'logout' && <LogoutPage onConfirm={handleLogout} onCancel={() => handleNavigate(currentUser?.role === 'pet-owner' ? 'pet-dashboard' : 'admin-workflow')} />}
        {currentPage === 'terms' && <TermsPage onNavigate={handleNavigate} />}
        {currentPage === 'privacy' && <PrivacyPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-guide-list' && <ManageGuideListPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-guide-create' && <CreateGuidePage onNavigate={handleNavigate} />}
        {currentPage === 'admin-guide-edit' && <EditGuidePage onNavigate={handleNavigate} guideId={pageData?.guideId} />}
        {currentPage === 'admin-guide-detail' && <GuideDetailPage onNavigate={handleNavigate} guideId={pageData?.guideId} />}
        {currentPage === 'admin-guide-approve' && <ApproveGuidePage onNavigate={handleNavigate} guideId={pageData?.guideId} />}
        {currentPage === 'admin-video-list' && <ManageVideoListPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-video-add' && <AddEditVideoPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-video-edit' && <AddEditVideoPage onNavigate={handleNavigate} videoId={pageData?.videoId} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
