import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Star,
  LogOut,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil,
} from 'lucide-react';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api';
import { IUser, IFormattedProduct, IDietitianReview } from '../types';

type Verdict = IDietitianReview['verdict'];

const VERDICTS: { value: Verdict; label: string; style: string }[] = [
  { value: 'everyday', label: 'Fine every day', style: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
  { value: 'occasional', label: 'Occasionally', style: 'border-amber-300 bg-amber-50 text-amber-900' },
  { value: 'rarely', label: 'Rarely', style: 'border-amber-500 bg-amber-100 text-amber-950' },
  { value: 'avoid', label: 'Avoid', style: 'border-rose-400 bg-rose-50 text-rose-900' },
];

const SUITABLE_FOR = [
  'Diabetics',
  'Weight loss',
  'Heart health',
  'Children',
  'Pregnancy',
  'Elderly',
  'Athletes',
  'High-protein diets',
];

export const verdictLabel = (v: Verdict) => VERDICTS.find((x) => x.value === v)?.label || v;
export const verdictStyle = (v: Verdict) => VERDICTS.find((x) => x.value === v)?.style || '';

export function Stars({ value, size = 'w-3.5 h-3.5' }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
      ))}
    </span>
  );
}

export const DietitianPortal: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Auth form
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [credentials, setCredentials] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Product search
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<IFormattedProduct[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Feedback form
  const [selected, setSelected] = useState<IFormattedProduct | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [suitableFor, setSuitableFor] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [myReviews, setMyReviews] = useState<IDietitianReview[]>([]);

  const isDietitian = user?.role === 'dietitian';

  useEffect(() => {
    (async () => {
      if (getStoredToken()) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch {
          clearStoredToken();
        }
      }
      setCheckingSession(false);
    })();
  }, []);

  useEffect(() => {
    if (!isDietitian) return;
    api
      .getMyReviews()
      .then((res) => setMyReviews(res.reviews))
      .catch((err) => console.warn('Failed to load reviews:', err));
  }, [isDietitian]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res =
        mode === 'login'
          ? await api.login({ email, password })
          : await api.register({ email, password, name, role: 'dietitian', credentials });
      if (res.user.role !== 'dietitian') {
        setAuthError('This is a shopper account. Sign in with a dietitian account, or register as one.');
        return;
      }
      setStoredToken(res.token);
      setUser(res.user);
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredToken();
    setUser(null);
    setSelected(null);
    setResults([]);
    setMyReviews([]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      if (/^\d{8,14}$/.test(q)) {
        const res = await api.getProductByBarcode(q, 'ALL');
        setResults([res.product]);
      } else {
        const res = await api.searchProducts(q, 'all', 'ALL');
        setResults(res.results);
        if (res.results.length === 0) setSearchError(`No products found for "${q}".`);
      }
    } catch (err: any) {
      setResults([]);
      setSearchError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Open a product in the form, pre-filling it if I've already reviewed it
  const selectProduct = (product: IFormattedProduct) => {
    setSelected(product);
    setFormError(null);
    setNotice(null);
    const existing = myReviews.find((r) => r.barcode === product.barcode);
    setVerdict(existing?.verdict || null);
    setRating(existing?.rating || 0);
    setComment(existing?.comment || '');
    setSuitableFor(existing?.suitableFor || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editReview = async (review: IDietitianReview) => {
    try {
      const res = await api.getProductByBarcode(review.barcode, 'ALL');
      selectProduct(res.product);
    } catch (err: any) {
      setNotice(null);
      setFormError('Could not load that product: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!verdict) return setFormError('Choose how often this product can be eaten.');
    if (rating < 1) return setFormError('Give the product a rating from 1 to 5 stars.');
    if (comment.trim().length < 10) return setFormError('Please write at least 10 characters of feedback.');

    setSaving(true);
    setFormError(null);
    try {
      const res = await api.saveReview({ barcode: selected.barcode, verdict, rating, comment, suitableFor });
      setMyReviews((prev) => [res.review, ...prev.filter((r) => r.barcode !== res.review.barcode)]);
      setNotice(`Feedback on ${selected.name} saved. Shoppers will see it on the product page.`);
    } catch (err: any) {
      setFormError(err.message || 'Could not save feedback');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (barcode: string) => {
    if (!window.confirm('Delete your feedback on this product?')) return;
    try {
      await api.deleteReview(barcode);
      setMyReviews((prev) => prev.filter((r) => r.barcode !== barcode));
      if (selected?.barcode === barcode) {
        setVerdict(null);
        setRating(0);
        setComment('');
        setSuitableFor([]);
        setNotice('Feedback deleted.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Could not delete feedback');
    }
  };

  const alreadyReviewed = selected ? myReviews.some((r) => r.barcode === selected.barcode) : false;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-stone-50 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-lg leading-tight truncate">LabelLens for Dietitians</p>
              <p className="text-[11px] text-stone-500 leading-tight">Review products for shoppers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a href="/" className="hidden sm:flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-emerald-800">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to LabelLens</span>
            </a>
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {checkingSession ? (
          <div className="p-12 flex justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-800" />
          </div>
        ) : !user ? (
          /* ---------- Sign in / register ---------- */
          <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="space-y-1">
              <h1 className="font-display font-bold text-2xl">
                {mode === 'login' ? 'Dietitian sign in' : 'Register as a dietitian'}
              </h1>
              <p className="text-xs text-stone-500">
                Your feedback appears on product pages, with your name and registration number.
              </p>
            </div>

            <div className="flex p-1 bg-stone-100 rounded-xl text-xs font-medium">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setAuthError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg ${mode === m ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
                >
                  {m === 'login' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-3">
              {mode === 'register' && (
                <>
                  <Field label="Full name" value={name} onChange={setName} placeholder="Dr. Priya Nair" required />
                  <Field
                    label="Registration / licence number"
                    value={credentials}
                    onChange={setCredentials}
                    placeholder="e.g. RD-IN-12345"
                    required
                  />
                </>
              )}
              <Field label="Email" type="email" value={email} onChange={setEmail} required />
              <Field label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />

              {authError && (
                <p className="text-xs text-rose-700 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-sm font-semibold rounded-xl"
              >
                {authLoading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create dietitian account'}
              </button>
            </form>

            {mode === 'login' && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <p className="font-semibold">Demo dietitian account</p>
                <p className="font-mono mt-0.5">dietitian@labellens.dev · password123</p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('dietitian@labellens.dev');
                    setPassword('password123');
                  }}
                  className="mt-1.5 font-semibold underline underline-offset-2"
                >
                  Fill in demo details
                </button>
              </div>
            )}
          </div>
        ) : !isDietitian ? (
          /* ---------- Signed in, but as a shopper ---------- */
          <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-2xl p-6 space-y-3 text-sm">
            <h1 className="font-display font-bold text-xl">This isn&apos;t a dietitian account</h1>
            <p className="text-stone-600">
              You&apos;re signed in as <strong>{user.name}</strong> ({user.email}), which is a shopper account. Sign out and
              sign in with a dietitian account to give product feedback.
            </p>
            <button onClick={handleLogout} className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg">
              Sign out
            </button>
          </div>
        ) : (
          /* ---------- Dietitian workspace ---------- */
          <div className="space-y-8">
            <div>
              <h1 className="font-display font-bold text-2xl">Welcome, {user.name}</h1>
              <p className="text-xs text-stone-500">
                {user.credentials ? `Registration ${user.credentials} · ` : ''}
                Find any product, then leave your professional feedback on it.
              </p>
            </div>

            {notice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* Search */}
              <section className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                <h2 className="font-display font-bold text-base">1. Find a product</h2>
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-stone-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name (e.g. Maggi) or barcode"
                    className="w-full pl-9 pr-20 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-700"
                  />
                  <button
                    type="submit"
                    disabled={searching || !query.trim()}
                    className="absolute right-1.5 px-3 py-1.5 bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
                  >
                    {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
                  </button>
                </form>
                {searchError && <p className="text-xs text-rose-700">{searchError}</p>}

                <div className="space-y-2 max-h-[480px] overflow-y-auto">
                  {results.map((p) => {
                    const reviewed = myReviews.some((r) => r.barcode === p.barcode);
                    return (
                      <button
                        key={p.barcode}
                        onClick={() => selectProduct(p)}
                        className={`w-full p-2.5 flex items-center gap-3 rounded-xl border text-left transition-colors ${
                          selected?.barcode === p.barcode
                            ? 'border-emerald-600 bg-emerald-50/60'
                            : 'border-stone-200 hover:border-emerald-600/50'
                        }`}
                      >
                        <ProductThumb product={p} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-stone-500 truncate">{p.brand}</p>
                          <p className="text-xs font-semibold line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-stone-500">
                            Score {p.nutritionAnalysis.healthScore}/100
                            {reviewed && <span className="ml-1.5 text-emerald-800 font-semibold">· Reviewed</span>}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Feedback form */}
              <section className="lg:col-span-3 bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                <h2 className="font-display font-bold text-base">2. Give your feedback</h2>
                {!selected ? (
                  <p className="text-xs text-stone-500 py-8 text-center">Search for a product and pick it from the list.</p>
                ) : (
                  <form onSubmit={handleSave} className="space-y-5">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <ProductThumb product={selected} large />
                      <div className="min-w-0 text-xs space-y-1">
                        <p className="text-stone-500">
                          {selected.brand} · {selected.category}
                        </p>
                        <p className="font-display font-bold text-base text-stone-900">{selected.name}</p>
                        <p className="text-stone-600">
                          Health score <strong>{selected.nutritionAnalysis.healthScore}/100</strong> (grade{' '}
                          {selected.nutritionAnalysis.healthScoreGrade})
                          {selected.nutritionAnalysis.novaGroup ? ` · NOVA ${selected.nutritionAnalysis.novaGroup}` : ''}
                        </p>
                        <NutrientLine product={selected} />
                        {selected.ingredientsText && (
                          <details className="text-stone-500">
                            <summary className="cursor-pointer font-medium text-stone-700">Ingredients</summary>
                            <p className="mt-1 leading-relaxed">{selected.ingredientsText}</p>
                          </details>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-stone-700">How often can people eat this?</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {VERDICTS.map((v) => (
                          <button
                            key={v.value}
                            type="button"
                            onClick={() => setVerdict(v.value)}
                            className={`px-2 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                              verdict === v.value ? v.style + ' ring-2 ring-offset-1 ring-emerald-700/30' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-stone-700">Overall rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                n <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        ))}
                        {rating > 0 && <span className="ml-2 text-xs text-stone-500">{rating} / 5</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-stone-700">
                        Suitable for <span className="font-normal text-stone-400">(optional)</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SUITABLE_FOR.map((tag) => {
                          const on = suitableFor.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() =>
                                setSuitableFor((prev) => (on ? prev.filter((t) => t !== tag) : [...prev, tag]))
                              }
                              className={`px-2.5 py-1 rounded-full border text-xs ${
                                on ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="review-comment" className="text-xs font-semibold text-stone-700">
                        Your feedback
                      </label>
                      <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={5}
                        maxLength={2000}
                        placeholder="What should shoppers know? Portion advice, who should avoid it, better swaps…"
                        className="w-full p-3 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-700"
                      />
                      <p className="text-[11px] text-stone-400 text-right">{comment.length} / 2000</p>
                    </div>

                    {formError && (
                      <p className="text-xs text-rose-700 flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-sm font-semibold rounded-xl"
                      >
                        {saving ? 'Saving…' : alreadyReviewed ? 'Update feedback' : 'Submit feedback'}
                      </button>
                      {alreadyReviewed && (
                        <button
                          type="button"
                          onClick={() => handleDelete(selected.barcode)}
                          className="px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 rounded-xl"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </section>
            </div>

            {/* My reviews */}
            <section className="space-y-3">
              <h2 className="font-display font-bold text-base">Your feedback ({myReviews.length})</h2>
              {myReviews.length === 0 ? (
                <p className="text-xs text-stone-500">You haven&apos;t reviewed any products yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {myReviews.map((r) => (
                    <div key={r.id} className="p-4 bg-white border border-stone-200 rounded-2xl space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] text-stone-500 truncate">{r.brand}</p>
                          <p className="text-sm font-semibold line-clamp-1">{r.productName}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => editReview(r)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-800 hover:bg-emerald-50"
                            aria-label="Edit feedback"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.barcode)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50"
                            aria-label="Delete feedback"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${verdictStyle(r.verdict)}`}>
                          {verdictLabel(r.verdict)}
                        </span>
                        <Stars value={r.rating} />
                        <span className="text-[11px] text-stone-400">{new Date(r.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-stone-700 line-clamp-3">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-stone-700">{props.label}</span>
      <input
        type={props.type || 'text'}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        minLength={props.minLength}
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-700"
      />
    </label>
  );
}

function ProductThumb({ product, large }: { product: IFormattedProduct; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const size = large ? 'w-16 h-16' : 'w-11 h-11';
  return (
    <div className={`${size} rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center p-1`}>
      {product.image && !failed ? (
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <span className="text-[10px] font-bold text-stone-400">LL</span>
      )}
    </div>
  );
}

function NutrientLine({ product }: { product: IFormattedProduct }) {
  const n = product.nutrients || {};
  const pick = (key: string) => {
    const v = n[`${key}_100g`] ?? n[key];
    return v !== undefined && v !== null && !isNaN(Number(v)) ? Math.round(Number(v) * 10) / 10 : null;
  };
  const parts = [
    ['Sugar', pick('sugars'), 'g'],
    ['Salt', pick('salt'), 'g'],
    ['Sat. fat', pick('saturated-fat'), 'g'],
    ['Protein', pick('proteins'), 'g'],
    ['Fibre', pick('fiber'), 'g'],
  ].filter(([, v]) => v !== null);
  if (parts.length === 0) return null;
  return (
    <p className="text-stone-500">
      Per 100g: {parts.map(([label, v, unit]) => `${label} ${v}${unit}`).join(' · ')}
    </p>
  );
}
