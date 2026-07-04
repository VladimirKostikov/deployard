import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessLevel, AppSection } from '@dpd/shared';
import { ProtectedRoute, SectionRoute } from '../auth/ProtectedRoute';

const mockUseAuth = vi.fn();
const mockUseAccess = vi.fn();

vi.mock('../auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../auth/use-access', () => ({
  useAccess: () => mockUseAccess(),
}));

function renderProtectedRoute(initialPath = '/app') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<div>Protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function renderSectionRoute(section: AppSection, level = AccessLevel.VIEW) {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
        <Route element={<SectionRoute section={section} level={level} />}>
          <Route path="/admin" element={<div>Admin section</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAccess.mockReturnValue({ canAccess: () => true, isAdmin: false, access: [] });
  });

  it('redirects guests to login', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderProtectedRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders child route for authenticated users', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    renderProtectedRoute();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});

describe('SectionRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
  });

  it('redirects home when section access is missing', () => {
    mockUseAccess.mockReturnValue({
      canAccess: () => false,
      isAdmin: false,
      access: [],
    });

    renderSectionRoute(AppSection.ADMIN, AccessLevel.MANAGE);

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('renders section when access is granted', () => {
    mockUseAccess.mockReturnValue({
      canAccess: (section: AppSection, level: AccessLevel) =>
        section === AppSection.ADMIN && level === AccessLevel.MANAGE,
      isAdmin: false,
      access: [],
    });

    renderSectionRoute(AppSection.ADMIN, AccessLevel.MANAGE);

    expect(screen.getByText('Admin section')).toBeInTheDocument();
  });
});
