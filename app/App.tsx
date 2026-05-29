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
import { MfaScreenPage } from './pages/mfascreen';
import { authLogout, authMe, authRefresh, setSessionExpiredHandler } from './services/api';
import { FeedbackPage } from './pages/FeedbackPage';
import { PrivacyPage, TermsPage } from './pages/PolicyPages';
import { ReviewQueuePage } from './pages/vet_professional/reviewqueue';
import { VetReviewGuidePage } from './pages/vet_professional/reviewguide';
import { ReviewHistoryPage } from './pages/vet_professional/reviewhistory';
import { VetVideoListPage, VetEditVideoPage } from './pages/vet_professional/videomanagement';
import { VetProfilePage } from './pages/vet_professional/vet_profile';
import { PetOwnerProfilePage } from './pages/pet_owner/PetOwnerProfile';
import { StoreQuizPage } from './pages/pet_owner/storequiz';
import { ManageGuideListPage } from './pages/vet_admin/manageguide';
import { CreateGuidePage } from './pages/vet_admin/CreateGuide';
import { EditGuidePage } from './pages/vet_admin/EditGuide';
import { GuideDetailPage } from './pages/vet_admin/GuideDetail';
import { ApproveGuidePage } from './pages/vet_admin/ApproveGuide';
import { ManageVideoListPage } from './pages/vet_admin/managevideo';
import { AddEditVideoPage } from './pages/vet_admin/AddEditVideo';
import { ManageQuizListPage } from './pages/vet_admin/managequiz';
import { CreateEditQuizPage } from './pages/vet_admin/CreateEditQuiz';
import { QuizQuestionsPage } from './pages/vet_admin/QuizQuestions';
import { QuizPreviewPage } from './pages/vet_admin/QuizPreview';
import { ManageSpeciesListPage } from './pages/vet_admin/managespecies';
import { AddEditSpeciesPage } from './pages/vet_admin/AddEditSpecies';
import { ManageEmergencyListPage } from './pages/vet_admin/manageemergency';
import { AddEditEmergencyPage } from './pages/vet_admin/AddEditEmergency';
import { ManageCategoryListPage } from './pages/vet_admin/managecategory';
import { AddEditCategoryPage } from './pages/vet_admin/AddEditCategory';
import { ManageClinicListPage } from './pages/vet_admin/manageclinic';
import { AddEditClinicPage } from './pages/vet_admin/AddEditClinic';
import { ManageUserListPage } from './pages/vet_admin/manageuser';
import { AddEditUserPage } from './pages/vet_admin/AddEditUser';
import { ManageFeedbackPage } from './pages/vet_admin/managefeedback';
import { AdminProfilePage } from './pages/vet_admin/manageprofile';
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
  | 'mfa-screen'
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
  | 'admin-quiz-list'
  | 'admin-quiz-create'
  | 'admin-quiz-edit'
  | 'admin-quiz-questions'
  | 'admin-quiz-preview'
  | 'admin-species-list'
  | 'admin-species-add'
  | 'admin-species-edit'
  | 'admin-scenario-list'
  | 'admin-scenario-add'
  | 'admin-scenario-edit'
  | 'admin-category-list'
  | 'admin-category-add'
  | 'admin-category-edit'
  | 'manage-clinic-add'
  | 'manage-clinic-edit'
  | 'admin-vet-list'
  | 'admin-vet-add'
  | 'admin-vet-detail'
  | 'admin-feedback-list'
  | 'admin-profile'
  | 'vet-review-queue'
  | 'vet-review-history'
  | 'vet-videos'
  | 'vet-video-edit'
  | 'vet-profile'
  | 'pet-owner-profile'
  | 'pet-quiz-history';

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
      'admin-quiz-list',
      'admin-quiz-create',
      'admin-quiz-edit',
      'admin-quiz-questions',
      'admin-quiz-preview',
      'admin-species-list',
      'admin-species-add',
      'admin-species-edit',
      'admin-scenario-list',
      'admin-scenario-add',
      'admin-scenario-edit',
      'admin-category-list',
      'admin-category-add',
      'admin-category-edit',
      'manage-clinic-add',
      'manage-clinic-edit',
      'admin-vet-list',
      'admin-vet-add',
      'admin-vet-detail',
      'admin-feedback-list',
      'admin-profile',
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
        {currentPage === 'mfa-screen' && <MfaScreenPage onNavigate={handleNavigate} tempToken={pageData?.tempToken} onAuthSuccess={handleAuthSuccess} />}
        {currentPage === 'signup' && <AuthPage mode="signup" onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />}
        {currentPage === 'search' && <EmergencyPage onNavigate={handleNavigate} initialSpecies={pageData?.species} initialSearch={pageData?.search} />}
        {currentPage === 'species' && <SpeciesPage onNavigate={handleNavigate} species={pageData?.species || 'Dogs'} />}
        {currentPage === 'pet-dashboard' && <PetOwnerDashboard onNavigate={handleNavigate} />}
        {currentPage === 'pet-profile' && <PetProfilePage onNavigate={handleNavigate} />}
        {currentPage === 'pet-owner-profile' && <PetOwnerProfilePage onNavigate={handleNavigate} currentUser={currentUser} onUserUpdate={handleUserUpdate} />}
        {currentPage === 'pet-quiz-history' && <StoreQuizPage onNavigate={handleNavigate} currentUser={currentUser} />}
        {currentPage === 'manage-guide' && <ManageGuidePage onNavigate={handleNavigate} />}
        {currentPage === 'manage-quiz' && <ManageQuizPage onNavigate={handleNavigate} />}
        {currentPage === 'manage-clinic' && <ManageClinicListPage onNavigate={handleNavigate} />}
        {currentPage === 'manage-clinic-add' && <AddEditClinicPage onNavigate={handleNavigate} />}
        {currentPage === 'manage-clinic-edit' && <AddEditClinicPage onNavigate={handleNavigate} clinicId={pageData?.clinicId} />}
        {currentPage === 'admin-vet-list' && <ManageUserListPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-vet-add' && <AddEditUserPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-vet-detail' && <AddEditUserPage onNavigate={handleNavigate} vetId={pageData?.vetId} />}
        {currentPage === 'admin-feedback-list' && <ManageFeedbackPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-profile' && <AdminProfilePage onNavigate={handleNavigate} currentUser={currentUser} onUserUpdate={handleUserUpdate} />}
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
        {currentPage === 'admin-quiz-list' && <ManageQuizListPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-quiz-create' && <CreateEditQuizPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-quiz-edit' && <CreateEditQuizPage onNavigate={handleNavigate} quizId={pageData?.quizId} />}
        {currentPage === 'admin-quiz-questions' && <QuizQuestionsPage onNavigate={handleNavigate} quizId={pageData?.quizId} />}
        {currentPage === 'admin-quiz-preview' && <QuizPreviewPage onNavigate={handleNavigate} quizId={pageData?.quizId} />}
        {currentPage === 'admin-species-list' && <ManageSpeciesListPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-species-add' && <AddEditSpeciesPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-species-edit' && <AddEditSpeciesPage onNavigate={handleNavigate} speciesId={pageData?.speciesId} />}
        {currentPage === 'admin-scenario-list' && <ManageEmergencyListPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-scenario-add' && <AddEditEmergencyPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-scenario-edit' && <AddEditEmergencyPage onNavigate={handleNavigate} scenarioId={pageData?.scenarioId} />}
        {currentPage === 'admin-category-list' && <ManageCategoryListPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-category-add' && <AddEditCategoryPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-category-edit' && <AddEditCategoryPage onNavigate={handleNavigate} categoryId={pageData?.categoryId} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
