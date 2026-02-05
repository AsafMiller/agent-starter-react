'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  createdAt: string;
}

interface FaqItemProps {
  faq: Faq;
  onUpdate: (id: number, question: string, answer: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function AddFaqForm({
  onAdd,
  onCancel,
  categories,
}: {
  onAdd: (question: string, answer: string, category: string) => Promise<void>;
  onCancel: () => void;
  categories: string[];
}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState(categories[0] || 'general');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const finalCategory = isNewCategory ? newCategoryName : category;
    if (!question.trim() || !answer.trim() || !finalCategory.trim()) return;
    setIsLoading(true);
    try {
      await onAdd(question, answer, finalCategory);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-border bg-card mb-6 rounded-lg border p-4">
      <h3 className="text-foreground mb-4 text-lg font-semibold">Add New FAQ</h3>
      <div className="space-y-3">
        <div>
          <label className="text-muted-foreground text-sm">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question..."
            className="border-border bg-background text-foreground mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-muted-foreground text-sm">Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter the answer..."
            rows={3}
            className="border-border bg-background text-foreground mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-muted-foreground text-sm">Category</label>
          <select
            value={isNewCategory ? '__new__' : category}
            onChange={(e) => {
              if (e.target.value === '__new__') {
                setIsNewCategory(true);
                setNewCategoryName('');
              } else {
                setIsNewCategory(false);
                setCategory(e.target.value);
              }
            }}
            className="border-border bg-background text-foreground mt-1 w-full rounded border px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__new__">+ New Category</option>
          </select>
          {isNewCategory && (
            <input
              type="text"
              value={newCategoryName}
              placeholder="Enter new category name..."
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="border-border bg-background text-foreground mt-2 w-full rounded border px-3 py-2 text-sm"
            />
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !question.trim() ||
            !answer.trim() ||
            (isNewCategory && !newCategoryName.trim())
          }
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isLoading ? 'Adding...' : 'Add FAQ'}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="border-border hover:bg-accent rounded border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function FaqItem({ faq, onUpdate, onDelete }: FaqItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState(faq.question);
  const [editAnswer, setEditAnswer] = useState(faq.answer);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(faq.id, editQuestion, editAnswer);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(faq.id);
    } finally {
      setIsLoading(false);
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return (
      <div className="border-border bg-destructive/10 border-l-destructive rounded border-l-2 px-4 py-3">
        <p className="text-foreground text-sm font-medium">Delete this FAQ?</p>
        <p className="text-muted-foreground mt-1 text-xs">{faq.question}</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded px-3 py-1 text-xs font-medium disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Confirm Delete'}
          </button>
          <button
            onClick={() => setIsDeleting(false)}
            disabled={isLoading}
            className="border-border hover:bg-accent rounded border px-3 py-1 text-xs font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="border-border bg-muted/30 rounded border-l-2 px-4 py-3">
        <div className="space-y-2">
          <div>
            <label className="text-muted-foreground text-xs">Question</label>
            <input
              type="text"
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className="border-border bg-background text-foreground mt-1 w-full rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground text-xs">Answer</label>
            <textarea
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              rows={3}
              className="border-border bg-background text-foreground mt-1 w-full rounded border px-2 py-1 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded px-3 py-1 text-xs font-medium disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="border-border hover:bg-accent flex items-center gap-1 rounded border px-3 py-1 text-xs font-medium disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-muted/30 group rounded border-l-2 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-foreground text-sm font-medium">{faq.question}</p>
          <p className="text-muted-foreground mt-1 text-sm">{faq.answer}</p>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded p-1"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded p-1"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  category,
  faqs,
  onUpdate,
  onDelete,
}: {
  category: string;
  faqs: Faq[];
  onUpdate: (id: number, question: string, answer: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="h-fit">
      <Collapsible.Trigger className="border-border bg-card hover:bg-accent/50 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors">
        <span className="text-foreground text-base font-semibold capitalize">{category}</span>
        <div className="flex items-center gap-2">
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
            {faqs.length}
          </span>
          <ChevronRight
            className={`text-muted-foreground h-5 w-5 transition-transform ${open ? 'rotate-90' : ''}`}
          />
        </div>
      </Collapsible.Trigger>
      <Collapsible.Content className="mt-2 space-y-2">
        {faqs.map((faq) => (
          <FaqItem key={faq.id} faq={faq} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function FaqList() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/faq');
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }
      const data = await response.json();
      setFaqs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAdd = async (question: string, answer: string, category: string) => {
    const response = await fetch('http://localhost:5000/api/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, category }),
    });

    if (!response.ok) {
      throw new Error('Failed to add FAQ');
    }

    const newFaq = await response.json();
    setFaqs((prev) => [newFaq, ...prev]);
    setIsAdding(false);
  };

  const handleUpdate = async (id: number, question: string, answer: string) => {
    const faq = faqs.find((f) => f.id === id);
    if (!faq) return;

    const response = await fetch(`http://localhost:5000/api/faq/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, category: faq.category }),
    });

    if (!response.ok) {
      throw new Error('Failed to update FAQ');
    }

    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, question, answer } : f)));
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`http://localhost:5000/api/faq/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete FAQ');
    }

    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const categories = [...new Set(faqs.map((f) => f.category || 'general'))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading FAQs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  const groupedFaqs = faqs.reduce(
    (acc, faq) => {
      const category = faq.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    },
    {} as Record<string, Faq[]>
  );

  return (
    <div>
      {isAdding ? (
        <AddFaqForm
          onAdd={handleAdd}
          onCancel={() => setIsAdding(false)}
          categories={categories.length > 0 ? categories : ['general']}
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mb-6 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add FAQ
        </button>
      )}

      {faqs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">No FAQs found. Add your first FAQ!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <CategorySection
              key={category}
              category={category}
              faqs={categoryFaqs}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
