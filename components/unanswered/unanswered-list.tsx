'use client';

import { useEffect, useState } from 'react';
import { Check, MessageSquarePlus, Trash2, X } from 'lucide-react';

interface UnansweredQuestion {
  id: number;
  question: string;
  frequency: number;
  timestamp: string;
  reviewed: boolean;
}

interface ConvertFormProps {
  question: UnansweredQuestion;
  categories: string[];
  onConvert: (id: number, answer: string, category: string) => Promise<void>;
  onCancel: () => void;
}

function ConvertForm({ question, categories, onConvert, onCancel }: ConvertFormProps) {
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState(categories[0] || 'general');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const finalCategory = isNewCategory ? newCategoryName : category;
    if (!answer.trim() || !finalCategory.trim()) return;
    setIsLoading(true);
    try {
      await onConvert(question.id, answer, finalCategory);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <h4 className="text-foreground mb-3 font-medium">Convert to FAQ</h4>
      <div className="mb-3">
        <label className="text-muted-foreground text-xs">Question</label>
        <p className="text-foreground text-sm">{question.question}</p>
      </div>
      <div className="mb-3">
        <label className="text-muted-foreground text-xs">Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the answer..."
          rows={3}
          className="border-border bg-background text-foreground mt-1 w-full rounded border px-3 py-2 text-sm"
        />
      </div>
      <div className="mb-3">
        <label className="text-muted-foreground text-xs">Category</label>
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
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !answer.trim() || (isNewCategory && !newCategoryName.trim())}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          {isLoading ? 'Converting...' : 'Convert to FAQ'}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="border-border hover:bg-accent flex items-center gap-1 rounded border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

interface QuestionItemProps {
  question: UnansweredQuestion;
  categories: string[];
  onConvert: (id: number, answer: string, category: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function QuestionItem({ question, categories, onConvert, onDelete }: QuestionItemProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(question.id);
    } finally {
      setIsLoading(false);
      setIsDeleting(false);
    }
  };

  if (isConverting) {
    return (
      <ConvertForm
        question={question}
        categories={categories}
        onConvert={onConvert}
        onCancel={() => setIsConverting(false)}
      />
    );
  }

  if (isDeleting) {
    return (
      <div className="border-border bg-destructive/10 border-l-destructive rounded border border-l-2 p-4">
        <p className="text-foreground text-sm font-medium">Delete this question?</p>
        <p className="text-muted-foreground mt-1 text-xs">{question.question}</p>
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

  return (
    <div className="border-border bg-card group rounded border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-foreground text-sm font-medium">{question.question}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Asked {question.frequency}x
            </span>
            <span className="text-muted-foreground text-xs">
              {new Date(question.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setIsConverting(true)}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded p-1.5"
            title="Convert to FAQ"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded p-1.5"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnansweredList() {
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [categories, setCategories] = useState<string[]>(['general']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/unansweredquestion');
      if (!response.ok) {
        throw new Error('Failed to fetch unanswered questions');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/faq');
      if (!response.ok) return;
      const data = await response.json();
      const cats = [...new Set(data.map((f: { category: string | null }) => f.category || 'general'))] as string[];
      if (cats.length > 0) {
        setCategories(cats);
      }
    } catch {
      // Ignore category fetch errors
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const handleConvert = async (id: number, answer: string, category: string) => {
    const response = await fetch(`http://localhost:5000/api/unansweredquestion/${id}/convert-to-faq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, category }),
    });

    if (!response.ok) {
      throw new Error('Failed to convert to FAQ');
    }

    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`http://localhost:5000/api/unansweredquestion/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete question');
    }

    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading unanswered questions...</div>
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

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">No unanswered questions. Great job!</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          question={question}
          categories={categories}
          onConvert={handleConvert}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
