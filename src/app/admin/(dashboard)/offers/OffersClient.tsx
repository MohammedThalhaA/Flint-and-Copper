"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Link as LinkIcon, Upload } from "lucide-react";
import { format } from "date-fns";

type Offer = {
  id: number;
  title: string;
  description: string;
  discount_text: string | null;
  image_data: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
};

import { useToast, useConfirm } from "@/components/NotificationProvider";

export function OffersClient({ initialOffers }: { initialOffers: Offer[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<Offer>>({
    title: "", description: "", discount_text: "", image_data: null, start_date: null, end_date: null, is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({ title: "", description: "", discount_text: "", image_data: null, start_date: null, end_date: null, is_active: true });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (offer: Offer) => {
    setFormData({
      ...offer,
      start_date: offer.start_date ? offer.start_date.split('T')[0] : null,
      end_date: offer.end_date ? offer.end_date.split('T')[0] : null,
    });
    setEditingId(offer.id);
    setIsAdding(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("File is too large. Please select an image under 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setFormData({ ...formData, image_data: base64 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await fetch(`/api/admin/offers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`/api/admin/offers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }
      router.refresh();
      resetForm();
      window.location.reload();
      toast("Offer saved successfully", "success");
    } catch (error) {
      toast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm("Are you sure you want to delete this offer?"))) return;
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
      if (!res.ok) toast("Error deleting", "error");
      else {
        toast("Offer deleted", "info");
        router.refresh();
      }
    } catch (e) {
      toast("Error deleting offer", "error");
    }
  };

  return (
    <div>
      <div className="mb-6">
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-copper text-ivory px-6 py-3 text-xs uppercase tracking-widest hover:bg-copper-deep transition-colors"
          >
            <Plus size={16} /> Create Offer
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 md:p-8 border border-dust/30 mb-8">
          <h2 className="font-serif text-lg md:text-xl md:text-2xl mb-6">{editingId ? 'Edit Offer' : 'New Offer'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Title</label>
                <input required type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" placeholder="e.g. Summer Spa Package" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Discount / Highlight Text</label>
                <input type="text" value={formData.discount_text || ''} onChange={e => setFormData({...formData, discount_text: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" placeholder="e.g. 20% OFF" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Description</label>
              <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-dust/30 p-3 focus:outline-none focus:border-copper h-24" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Start Date (Optional)</label>
                <input type="date" value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">End Date (Optional)</label>
                <input type="date" value={formData.end_date || ''} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" />
              </div>
            </div>

            {/* Image Handling */}
            <div className="border border-dust/30 p-4">
              <label className="block text-xs uppercase tracking-widest mb-4 text-charcoal/70">Offer Image (Optional)</label>
              <div className="flex gap-4 mb-4">
                <button type="button" onClick={() => setImageInputMode('upload')} className={`text-xs uppercase tracking-widest px-4 py-2 ${imageInputMode === 'upload' ? 'bg-copper text-white' : 'bg-dust/10'}`}>Upload</button>
                <button type="button" onClick={() => setImageInputMode('url')} className={`text-xs uppercase tracking-widest px-4 py-2 ${imageInputMode === 'url' ? 'bg-copper text-white' : 'bg-dust/10'}`}>Paste URL</button>
              </div>

              {imageInputMode === 'upload' ? (
                <div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm border border-dust/30 px-4 py-2 hover:bg-dust/5">
                    <Upload size={16} /> Select Image
                  </button>
                </div>
              ) : (
                <div>
                  <input type="url" value={formData.image_data?.startsWith('http') ? formData.image_data : ''} onChange={e => setFormData({...formData, image_data: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" placeholder="https://..." />
                </div>
              )}

              {formData.image_data && (
                <div className="mt-4">
                  <p className="text-xs text-dust mb-2">Preview:</p>
                  <img src={formData.image_data} alt="Preview" className="h-32 object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 accent-copper" />
              <label htmlFor="isActive" className="text-sm">Active (Will automatically hide if past End Date)</label>
            </div>
            <div className="flex gap-4 mt-4">
              <button type="submit" disabled={isSubmitting} className="bg-copper text-ivory px-6 py-3 text-xs uppercase tracking-widest hover:bg-copper-deep flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Save Offer'}
              </button>
              <button type="button" onClick={resetForm} className="border border-dust/30 text-charcoal px-6 py-3 text-xs uppercase tracking-widest hover:bg-dust/10">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map(offer => {
          const isExpired = offer.end_date && new Date(offer.end_date) < new Date();
          return (
            <div key={offer.id} className={`border ${!offer.is_active || isExpired ? 'border-dust/30 bg-dust/5 opacity-70' : 'border-copper/30 bg-white'} relative overflow-hidden flex flex-col`}>
              {offer.image_data && (
                <div className="h-48 overflow-hidden bg-dust/10">
                  <img src={offer.image_data} alt={offer.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-lg md:text-xl text-charcoal">{offer.title}</h3>
                  {offer.discount_text && (
                    <span className="bg-copper text-white text-[10px] uppercase tracking-widest px-2 py-1">{offer.discount_text}</span>
                  )}
                </div>
                <p className="text-sm text-charcoal/70 mb-4 line-clamp-3">{offer.description}</p>
                <div className="mt-auto pt-4 border-t border-dust/20 text-xs text-charcoal/50 flex justify-between items-center">
                  <span>
                    {isExpired ? <span className="text-red-500">Expired</span> : offer.is_active ? <span className="text-green-600">Active</span> : <span>Inactive</span>}
                  </span>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(offer)} className="hover:text-copper"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(offer.id)} className="hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
