import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminHeader } from './AdminHeader';

const currentUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'administrator' as const,
};

describe('AdminHeader', () => {
  it('renders administrator navigation and user controls', () => {
    render(
      <AdminHeader
        currentPage="admin-workflow"
        currentUser={currentUser}
        onLogout={jest.fn()}
        onNavigate={jest.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'VAFIS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guides' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admin User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('navigates when primary nav buttons are clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = jest.fn();

    render(
      <AdminHeader
        currentPage="admin-workflow"
        currentUser={currentUser}
        onLogout={jest.fn()}
        onNavigate={onNavigate}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Guides' }));
    await user.click(screen.getByRole('button', { name: 'Clinics' }));
    await user.click(screen.getByRole('button', { name: 'Feedback' }));

    expect(onNavigate).toHaveBeenCalledWith('admin-guide-list');
    expect(onNavigate).toHaveBeenCalledWith('manage-clinic');
    expect(onNavigate).toHaveBeenCalledWith('admin-feedback-list');
  });

  it('opens the content menu and navigates to a selected content page', async () => {
    const user = userEvent.setup();
    const onNavigate = jest.fn();

    render(
      <AdminHeader
        currentPage="admin-workflow"
        currentUser={currentUser}
        onLogout={jest.fn()}
        onNavigate={onNavigate}
      />,
    );

    await user.click(screen.getByRole('button', { name: /content/i }));
    await user.click(screen.getByRole('button', { name: 'Videos' }));

    expect(onNavigate).toHaveBeenCalledWith('admin-video-list');
    expect(screen.queryByRole('button', { name: 'Videos' })).not.toBeInTheDocument();
  });

  it('calls logout when the logout button is clicked', async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();

    render(
      <AdminHeader
        currentPage="admin-workflow"
        currentUser={currentUser}
        onLogout={onLogout}
        onNavigate={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
