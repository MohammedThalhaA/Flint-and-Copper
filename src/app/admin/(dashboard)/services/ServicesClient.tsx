"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

type Service = {
  id: number;
  name: string;
  category: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  display_order: number;
};

import { useToast, useConfirm } from "@/components/NotificationProvider";

export function ServicesClient({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Service>>({
    name: "", category: "Hair", description: "", duration_minutes: 60, price: 0, is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = Array.from(new Set(services.map(s => s.category)));
  if (!categories.includes("Hair")) categories.push("Hair");
  if (!categories.includes("Skin")) categories.push("Skin");
  if (!categories.includes("Body")) categories.push("Body");

  const resetForm = () => {
    setFormData({ name: "", category: "Hair", description: "", duration_minutes: 60, price: 0, is_active: true });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (service: Service) => {
    setFormData(service);
    setEditingId(service.id);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await fetch(`/api/admin/services/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`/api/admin/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }
      router.refresh();
      resetForm();
      // Simple local state update to avoid waiting for full refresh to feel snappy
      window.location.reload(); 
      toast("Service saved", "success");
    } catch (error) {
      toast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm("Are you sure you want to delete this service? If it has bookings, this will fail."))) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) toast(data.error || "Error deleting", "error");
      else {
        toast("Service deleted", "info");
        router.refresh();
      }
    } catch (e) {
      toast("Error deleting service", "error");
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down', category: string) => {
    const categoryServices = services.filter(s => s.category === category).sort((a, b) => a.display_order - b.display_order);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categoryServices.length - 1) return;

    const current = categoryServices[index];
    const swap = categoryServices[direction === 'up' ? index - 1 : index + 1];

    const currentOrder = current.display_order;
    current.display_order = swap.display_order;
    swap.display_order = currentOrder;

    // Optimistically update UI
    setServices([...services]);

    // Send to backend
    await fetch('/api/admin/services', {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: [
          { id: current.id, display_order: current.display_order },
          { id: swap.id, display_order: swap.display_order }
        ]
      })
    });
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6">
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-copper text-ivory px-6 py-3 text-xs uppercase tracking-widest hover:bg-copper-deep transition-colors"
          >
            <Plus size={16} /> Add New Service
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-6 md:p-8 border border-dust/30 mb-8">
          <h2 className="font-serif text-lg md:text-xl md:text-2xl mb-6">{editingId ? 'Edit Service' : 'New Service'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Name</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Category</label>
                <input required type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" placeholder="e.g. Hair, Skin, Body" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Price (₹)</label>
                <input required type="number" step="0.01" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Duration (Minutes)</label>
                <input required type="number" value={formData.duration_minutes || ''} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Description</label>
              <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-dust/30 p-3 focus:outline-none focus:border-copper h-24" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 accent-copper" />
              <label htmlFor="isActive" className="text-sm">Active (Visible on public site)</label>
            </div>
            <div className="flex gap-4">
              <button type="submit" disabled={isSubmitting} className="bg-copper text-ivory px-6 py-3 text-xs uppercase tracking-widest hover:bg-copper-deep flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Save Service'}
              </button>
              <button type="button" onClick={resetForm} className="border border-dust/30 text-charcoal px-6 py-3 text-xs uppercase tracking-widest hover:bg-dust/10">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {categories.map(category => {
          const categoryServices = services.filter(s => s.category === category).sort((a, b) => a.display_order - b.display_order);
          if (categoryServices.length === 0) return null;
          
          return (
            <div key={category}>
              <h3 className="font-serif text-lg md:text-xl md:text-2xl mb-4 text-charcoal flex items-center gap-4">
                {category} <span className="text-sm font-sans text-dust">({categoryServices.length})</span>
              </h3>
              <div className="bg-white border border-dust/30">
                {categoryServices.map((service, idx) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border-b border-dust/10 last:border-0 hover:bg-dust/5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{service.name}</span>
                        {!service.is_active && <span className="text-[10px] uppercase tracking-widest bg-dust/20 px-2 py-0.5 rounded-full text-charcoal/60">Inactive</span>}
                      </div>
                      <div className="text-sm text-charcoal/60 mt-1 flex gap-4">
                        <span>₹{service.price}</span>
                        <span>{service.duration_minutes} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveOrder(idx, 'up', category)} disabled={idx === 0} className="text-dust hover:text-copper disabled:opacity-30"><ArrowUp size={16} /></button>
                        <button onClick={() => moveOrder(idx, 'down', category)} disabled={idx === categoryServices.length - 1} className="text-dust hover:text-copper disabled:opacity-30"><ArrowDown size={16} /></button>
                      </div>
                      <div className="w-[1px] h-8 bg-dust/20"></div>
                      <button onClick={() => handleEdit(service)} className="p-2 text-dust hover:text-copper" title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(service.id)} className="p-2 text-dust hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
