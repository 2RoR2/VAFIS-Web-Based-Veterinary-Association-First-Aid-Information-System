import { Plus, FileText, Video, Brain, CheckCircle, Clock, Edit, Trash2, Users, Eye, Bell, History } from 'lucide-react';
import { useState } from 'react';
import vetDashboardImage from '../assets/guided.jpg';
import { useApiData } from '../hooks/useApiData';
import { AuditLogItem, FeedbackItem, Guide, NotificationItem, Quiz, Video as VideoItem } from '../types/content';

interface AdminPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'guides' | 'videos' | 'quizzes'>('guides');
  const { data: guides, loading: guidesLoading, error: guidesError } = useApiData<Guide[]>('/guides', []);
  const { data: videos, loading: videosLoading, error: videosError } = useApiData<VideoItem[]>('/videos', []);
  const { data: quizzes, loading: quizzesLoading, error: quizzesError } = useApiData<Quiz[]>('/quizzes', []);
  const { data: notifications, loading: notificationsLoading, error: notificationsError } = useApiData<NotificationItem[]>('/workflow/notifications', []);
  const { data: auditLogs, loading: auditLogsLoading, error: auditLogsError } = useApiData<AuditLogItem[]>('/workflow/audit-logs', []);
  const { data: feedbackItems, loading: feedbackLoading, error: feedbackError } = useApiData<FeedbackItem[]>('/feedback', []);
  const hasLoading = guidesLoading || videosLoading || quizzesLoading || notificationsLoading || auditLogsLoading || feedbackLoading;
  const loadError = guidesError || videosError || quizzesError || notificationsError || auditLogsError || feedbackError;

  const publishedGuides = guides.length;
  const publishedVideos = videos.length;
  const publishedQuizzes = quizzes.length;

  const guidesList = guides.map((guide) => ({
    id: guide.id,
    title: guide.title,
    status: 'published' as const,
    lastReviewed: guide.lastReviewed,
  }));

  const videosList = videos.map((video) => ({
    id: video.id,
    title: video.title,
    status: 'published' as const,
    duration: video.duration,
    views: video.views,
  }));

  const quizzesList = quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.length,
    status: 'published' as const,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-center mb-8">
          <div>
            <h1 className="mb-2">Content Management Dashboard</h1>
            <p className="text-muted-foreground">
              Manage first-aid guides, videos, and quiz content. All content must be reviewed before publication.
            </p>
          </div>
          <div className="paw-card bg-white rounded-3xl border border-border p-3">
            <img
              src={vetDashboardImage}
              alt="Veterinary professional reviewing content on a tablet"
              className="w-full aspect-[4/3] object-cover rounded-2xl"
            />
          </div>
        </div>
        {loadError && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Unable to load admin data. {loadError}
          </div>
        )}
        {hasLoading && !loadError && (
          <p className="mb-6 text-sm text-muted-foreground">Loading admin data...</p>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl">{publishedGuides}</p>
                <p className="text-sm text-muted-foreground">Total Guides</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl">{publishedVideos}</p>
                <p className="text-sm text-muted-foreground">Video Tutorials</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent/50 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl">{publishedQuizzes}</p>
                <p className="text-sm text-muted-foreground">Active Quizzes</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl">{videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <section className="bg-white rounded-lg border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2>Notifications</h2>
                <p className="text-sm text-muted-foreground">Review requests, revision alerts, and overdue content reminders.</p>
              </div>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{notification.audience}</p>
                      <h4>{notification.event}</h4>
                    </div>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {notification.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-lg border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2>Audit Log</h2>
                <p className="text-sm text-muted-foreground">Secure record of content lifecycle and approval actions.</p>
              </div>
            </div>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{log.actor}</p>
                      <h4>{log.action}</h4>
                      <p className="text-sm text-muted-foreground">{log.target}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white rounded-lg border border-border p-5 mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2>Feedback Management</h2>
              <p className="text-sm text-muted-foreground">Review pet owner ratings and comments for guides, quizzes, videos, and clinic directory content.</p>
            </div>
            <span className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
              {feedbackItems.length} submissions
            </span>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {feedbackItems.map((item) => (
              <article key={item.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.contentType}</p>
                    <h4>{item.contentTitle}</h4>
                  </div>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{item.status}</span>
                </div>
                <div className="text-warning mb-2">{item.rating}/5 rating</div>
                <p className="text-sm text-muted-foreground mb-3">{item.comment}</p>
                <div className="text-xs text-muted-foreground">
                  <p>{item.submittedBy}</p>
                  <p>{item.submittedAt}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="bg-white rounded-lg border border-border">
          <div className="border-b border-border">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('guides')}
                className={`px-4 py-4 border-b-2 transition-colors ${
                  activeTab === 'guides'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                First-Aid Guides
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-4 border-b-2 transition-colors ${
                  activeTab === 'videos'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`px-4 py-4 border-b-2 transition-colors ${
                  activeTab === 'quizzes'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Quizzes
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3>
                {activeTab === 'guides' && 'Manage First-Aid Guides'}
                {activeTab === 'videos' && 'Manage Videos'}
                {activeTab === 'quizzes' && 'Manage Quizzes'}
              </h3>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New
              </button>
            </div>

            {activeTab === 'guides' && (
              <div className="space-y-3">
                {guidesList.slice(0, 10).map((guide) => (
                  <div
                    key={guide.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="mb-1">{guide.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(guide.status)}`}>
                          {guide.status.charAt(0).toUpperCase() + guide.status.slice(1)}
                        </span>
                        {guide.lastReviewed && <span>Last reviewed: {guide.lastReviewed}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Delete">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-3">
                {videosList.slice(0, 10).map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="mb-1">{video.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(video.status)}`}>
                          {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                        </span>
                        <span>Duration: {video.duration}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Delete">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="space-y-3">
                {quizzesList.slice(0, 10).map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="mb-1">{quiz.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(quiz.status)}`}>
                          {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                        </span>
                        <span>{quiz.questions} questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-md transition-colors" aria-label="Delete">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
