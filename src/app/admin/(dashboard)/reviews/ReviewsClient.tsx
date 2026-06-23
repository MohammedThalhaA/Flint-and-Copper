"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Star, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

type Review = {
  id: number;
  author: string;
  text: string;
  rating: number;
  is_approved: boolean;
  is_featured: boolean;
  source: string;
  created_at: string;
};

import { useToast, useConfirm } from "@/components/NotificationProvider";

export function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState("all");
  
  const [formData, setFormData] = useState<Partial<Review>>({
    author: "", text: "", rating: 5, source: "Google", is_approved: true, is_featured: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const resetForm = () => {
    setFormData({ author: "", text: "", rating: 5, source: "Google", is_approved: true, is_featured: false });
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`/api/admin/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      router.refresh();
      resetForm();
      toast("Review saved", "success");
    } catch (error) {
      toast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm("Are you sure you want to delete this review?"))) return;
    try {
      setReviews(prev => prev.filter(r => r.id !== id));
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      toast("Review deleted", "info");
      router.refresh();
    } catch (e) {
      toast("Error deleting", "error");
      setReviews(initialReviews);
    }
  };

  const toggleToggle = async (id: number, field: 'is_approved' | 'is_featured', currentValue: boolean) => {
    setLoadingId(id);
    try {
      const review = reviews.find(r => r.id === id);
      if (!review) return;

      const payload = {
        is_approved: field === 'is_approved' ? !currentValue : review.is_approved,
        is_featured: field === 'is_featured' ? !currentValue : review.is_featured,
      };

      setReviews(prev => prev.map(r => r.id === id ? { ...r, ...payload } : r));

      await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      toast("Review updated", "success");
      router.refresh();
    } catch (e) {
      toast("Error updating", "error");
      setReviews(initialReviews);
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = reviews.filter(r => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "featured") return r.is_featured;
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-dust/30 bg-white px-4 py-2 text-sm focus:outline-none focus:border-copper"
        >
          <option value="all">All Reviews</option>
          <option value="pending">Pending Approval</option>
          <option value="featured">Featured (On Website)</option>
        </select>

        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-copper text-ivory px-6 py-3 text-xs uppercase tracking-widest hover:bg-copper-deep transition-colors"
          >
            <Plus size={16} /> Add Manual Review
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 md:p-8 border border-dust/30 mb-8">
          <h2 className="font-serif text-lg md:text-xl md:text-2xl mb-6">Add Manual Review</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Customer Name</label>
                <input required type="text" value={formData.author || ''} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Source</label>
                <input required type="text" value={formData.source || ''} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" placeholder="e.g. Google, Yelp, Walk-in" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Rating (1-5)</label>
                <input required type="number" min="1" max="5" value={formData.rating || 5} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Review Text</label>
              <textarea required value={formData.text || ''} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full border border-dust/30 p-3 focus:outline-none focus:border-copper h-24" />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isApproved" checked={formData.is_approved} onChange={e => setFormData({...formData, is_approved: e.target.checked})} className="w-4 h-4 accent-copper" />
                <label htmlFor="isApproved" className="text-sm">Approved (Visible as a valid review)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isFeatured" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-4 h-4 accent-copper" />
                <label htmlFor="isFeatured" className="text-sm">Featured (Shows on homepage carousel)</label>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <button type="submit" disabled={isSubmitting} className="bg-copper text-ivory px-6 py-3 text-xs uppercase tracking-widest hover:bg-copper-deep flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Save Review'}
              </button>
              <button type="button" onClick={resetForm} className="border border-dust/30 text-charcoal px-6 py-3 text-xs uppercase tracking-widest hover:bg-dust/10">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-dust/30 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#1A1A1A] text-ivory uppercase tracking-widest text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Review</th>
              <th className="px-6 py-4 font-medium">Rating & Source</th>
              <th className="px-6 py-4 font-medium text-center">Approved</th>
              <th className="px-6 py-4 font-medium text-center">Featured</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dust/20 text-charcoal/80">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center">No reviews found.</td></tr>
            ) : (
              filtered.map((review) => (
                <tr key={review.id} className="hover:bg-dust/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-charcoal">
                    {review.author}
                    <div className="text-xs text-dust font-normal mt-1">{format(new Date(review.created_at), 'MMM d, yyyy')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="whitespace-normal max-w-lg text-charcoal/70 line-clamp-2" title={review.text}>
                      {review.text}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-copper mb-1">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <div className="text-xs text-charcoal/50">{review.source}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleToggle(review.id, 'is_approved', review.is_approved)}
                      disabled={loadingId === review.id}
                      className={`inline-flex p-1 rounded-full ${review.is_approved ? 'text-green-600 hover:bg-green-50' : 'text-dust hover:bg-dust/10'}`}
                    >
                      {review.is_approved ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleToggle(review.id, 'is_featured', review.is_featured)}
                      disabled={loadingId === review.id || !review.is_approved}
                      className={`inline-flex p-1 rounded-full ${review.is_featured ? 'text-copper hover:bg-copper/10' : 'text-dust hover:bg-dust/10'} disabled:opacity-50`}
                      title={!review.is_approved ? "Must be approved first" : "Toggle Featured"}
                    >
                      {review.is_featured ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(review.id)} className="p-2 text-dust hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
