import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../../services/api';
import { ContentCategory } from '../../types/content';

interface AddEditCategoryPageProps {
  onNavigate: (page: string, data?: any) => void;
  categoryId?: string;
}

const emptyForm = {
  name:        '',
  description: '',
};

export function AddEditCategoryPage({ onNavigate, categoryId }: AddEditCategoryPageProps) {
  const isEdit = Boolean(categoryId);

  const [form, setForm]             = useState(emptyForm);
  const [loading, setLoading]       = useState(isEdit);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving]         = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit || !categoryId) return;
    apiGet<ContentCategory>(`/categories/${categoryId}`)
      .then((data) => {
        setForm({ name: data.name, description: data.description });
      })
      .catch((err) => setFetchError(err.message ?? 'Failed to load category.'))
      .finally(() => setLoading(false));
  }, [categoryId, isEdit]);

  /* ── Validation ────────────────────────────────────────────────────────── */

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Category name is required.';
    return e;
  };

  /* ── Submit ────────────────────────────────────────────────────────────── */

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
      };
      if (isEdit && categoryId) {
        await apiPut<ContentCategory>(`/categories/${categoryId}`, payload);
      } else {
        await apiPost<ContentCategory>('/categories', payload);
      }
      onNavigate('admin-category-list');
    } catch (err) {
      // Surface duplicate-name error from the API clearly
      alert(err instanceof Error ? err.message : 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / error ───────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading category...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{fetchError}</p>
          <button
            onClick={() => onNavigate('admin-category-list')}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            Back to Category List
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <button
          onClick={() => onNavigate('admin-category-list')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Category List
        </button>

        <h1 className="mb-6">{isEdit ? 'Edit Category' : 'Add Category'}</h1>

        <div className="bg-white rounded-lg border border-border p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Airway Emergencies, Trauma, Toxicology"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                errors.name ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Category names must be unique. This name will appear in guide and clinic dropdowns.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief explanation of what this category covers…"
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => onNavigate('admin-category-list')}
              disabled={saving}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
