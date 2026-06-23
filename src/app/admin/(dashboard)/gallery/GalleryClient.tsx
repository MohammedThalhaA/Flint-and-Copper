"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Upload, AlertTriangle } from "lucide-react";

type GalleryImage = {
  id: number;
  image_data: string | null;
  image_url: string | null;
  source_type: 'upload' | 'instagram';
};

import { useToast, useConfirm } from "@/components/NotificationProvider";

export function GalleryClient({ initialImages }: { initialImages: GalleryImage[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [images] = useState<GalleryImage[]>(initialImages);
  const [isAdding, setIsAdding] = useState(false);
  
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadData, setUploadData] = useState<string | null>(null);
  const [urlData, setUrlData] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const MAX_WIDTH = 1200; // Reasonable max for gallery
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setUploadData(base64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageInputMode === 'upload' && !uploadData) {
      toast("Please select an image", "error");
      return;
    }
    if (imageInputMode === 'url' && !urlData) {
      toast("Please enter a URL", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        source_type: imageInputMode === 'upload' ? 'upload' : 'instagram',
        image_data: imageInputMode === 'upload' ? uploadData : null,
        image_url: imageInputMode === 'url' ? urlData : null,
      };

      await fetch(`/api/admin/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      router.refresh();
      setIsAdding(false);
      setUploadData(null);
      setUrlData("");
      window.location.reload();
      toast("Image added to gallery", "success");
    } catch (error) {
      toast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm("Are you sure you want to remove this image?"))) return;
    try {
      await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      toast("Image removed", "info");
      router.refresh();
    } catch (e) {
      toast("Error deleting image", "error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center bg-white p-4 border border-dust/30">
        <div>
          <span className="font-serif text-lg md:text-xl">{images.length}</span> <span className="text-sm text-charcoal/60 uppercase tracking-widest">/ 5 Images Used</span>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-copper text-ivory px-6 py-3 text-xs uppercase tracking-widest hover:bg-copper-deep transition-colors"
        >
          {isAdding ? "Cancel" : "Add Image"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 md:p-8 border border-dust/30 mb-8 relative overflow-hidden">
          {images.length >= 5 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={18} />
              <p className="text-sm text-yellow-800">
                You already have 5 images. Adding a new one will automatically <strong className="font-medium">replace the oldest photo</strong> shown below.
              </p>
            </div>
          )}

          <h2 className="font-serif text-lg md:text-xl md:text-2xl mb-6">Add Gallery Image</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex gap-4 mb-2">
              <button type="button" onClick={() => setImageInputMode('upload')} className={`text-xs uppercase tracking-widest px-4 py-2 ${imageInputMode === 'upload' ? 'bg-copper text-white' : 'bg-dust/10'}`}>Upload File</button>
              <button type="button" onClick={() => setImageInputMode('url')} className={`text-xs uppercase tracking-widest px-4 py-2 ${imageInputMode === 'url' ? 'bg-copper text-white' : 'bg-dust/10'}`}>Paste Instagram URL</button>
            </div>

            {imageInputMode === 'upload' ? (
              <div>
                <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm border border-dust/30 px-6 py-3 hover:bg-dust/5">
                    <Upload size={16} /> Select Image
                  </button>
                  {uploadData && <span className="text-sm text-green-600">Image selected and compressed.</span>}
                </div>
                {uploadData && (
                  <img src={uploadData} alt="Preview" className="h-48 object-cover mt-4 border border-dust/30" />
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 text-charcoal/70">Direct Image URL</label>
                <input required type="url" value={urlData} onChange={e => setUrlData(e.target.value)} className="w-full border-b border-dust/30 py-2 focus:outline-none focus:border-copper" placeholder="https://instagram.com/..." />
                {urlData && (
                  <img src={urlData} alt="Preview" className="h-48 object-cover mt-4 border border-dust/30" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    toast("The URL provided does not seem to point to a valid image.", "error");
                  }} />
                )}
              </div>
            )}

            <div className="flex gap-4 mt-2">
              <button type="submit" disabled={isSubmitting} className="bg-copper text-ivory px-6 py-3 text-xs uppercase tracking-widest hover:bg-copper-deep flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Add to Gallery'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((img, idx) => (
          <div key={img.id} className="relative group aspect-square border border-dust/30 bg-dust/5">
            <img 
              src={img.source_type === 'upload' ? img.image_data! : img.image_url!} 
              alt={`Gallery ${idx + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => handleDelete(img.id)} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
            {idx === 0 && (
              <span className="absolute top-2 left-2 bg-charcoal/80 text-white text-[10px] uppercase tracking-widest px-2 py-1">Oldest</span>
            )}
            {idx === images.length - 1 && (
              <span className="absolute top-2 left-2 bg-copper text-white text-[10px] uppercase tracking-widest px-2 py-1">Newest</span>
            )}
          </div>
        ))}
        
        {/* Fill empty slots with placeholders up to 5 */}
        {Array.from({ length: Math.max(0, 5 - images.length) }).map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square border border-dashed border-dust/40 bg-dust/5 flex items-center justify-center text-dust/50">
            <span className="text-xs uppercase tracking-widest">Empty Slot</span>
          </div>
        ))}
      </div>
    </div>
  );
}
