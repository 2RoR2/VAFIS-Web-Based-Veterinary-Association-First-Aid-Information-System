import { Plus, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../../services/api';
import { ContentCategory } from '../../types/content';

interface ManageCategoryListPageProps {
  onNavigate: (page: string, data?: any) => void;
}

// Category management list page with add, edit, and delete actions and a confirmation modal for deletion.
export function ManageCategoryListPage({ onNavigate }: ManageCategoryListPageProps) {
  const [categories, setCategories]     = useState<ContentCategory[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentCategory | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<ContentCategory[]>('/categories', controller.signal)
      .then((data) => { setCategories(data); setError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message ?? 'Failed to load categories.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  // DELETEs the targeted category via the API and removes it from the local list on success.
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete<{ message: string }>(`/categories/${deleteTarget.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="mb-1">Category Management</h1>
            <p className="text-muted-foreground">
              Manage content categories shared across first-aid guides and clinic listings.
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin-category-add')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading categories...</div>
        )}
        {!loading && error && (
          <div className="text-center py-16 text-destructive text-sm">{error}</div>
        )}

        {/* List */}
        {!loading && !error && (
          categories.length === 0 ? (
            <div className="bg-white rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground mb-3">No categories added yet.</p>
              <button
                onClick={() => onNavigate('admin-category-add')}
                className="text-primary text-sm underline underline-offset-2"
              >
                Add the first category
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg border border-border p-4 flex items-center gap-4 hover:border-primary/40 transition-colors"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onNavigate('admin-category-edit', { categoryId: category.id })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(category)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md shadow-lg">
            <h3 className="mb-2">Delete Category</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Are you sure you want to delete:
            </p>
            <p className="text-sm font-medium mb-3">{deleteTarget.name}</p>
            <p className="text-sm text-destructive mb-6">
              This will remove the category from the system. Existing guides and clinic listings
              that use this category name will not be automatically updated.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
