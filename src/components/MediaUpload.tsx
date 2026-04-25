'use client';

import { useState } from 'react';
import { ImagePlus, Film, X, Loader2 } from 'lucide-react';
import type { BriefingMedia } from '@/types/briefing';
import { supabase } from '@/lib/supabase';

interface MediaUploadProps {
  media: BriefingMedia[];
  editable?: boolean;
  onChange?: (media: BriefingMedia[]) => void;
  briefingId: string;
  creativeType: string;
}

export function MediaUpload({ media, editable = false, onChange, briefingId, creativeType }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !onChange) return;

    setUploading(true);
    const newMedia: BriefingMedia[] = [...media];

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/');
      const ext = file.name.split('.').pop();
      const path = `${briefingId}/${creativeType}/${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('briefing-files')
        .upload(path, file, { upsert: true });

      if (data && !error) {
        const { data: urlData } = supabase.storage
          .from('briefing-files')
          .getPublicUrl(path);

        newMedia.push({
          id: crypto.randomUUID(),
          url: urlData.publicUrl,
          type: isVideo ? 'video' : 'image',
          caption: file.name,
          uploaded_at: new Date().toISOString(),
        });
      }
    }

    onChange(newMedia);
    setUploading(false);
    e.target.value = '';
  }

  function removeItem(id: string) {
    if (!onChange) return;
    onChange(media.filter(m => m.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map(item => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.caption || ''} className="w-full h-40 object-cover" />
              ) : (
                <video src={item.url} className="w-full h-40 object-cover" controls />
              )}
              {/* Caption */}
              <div className="px-2 py-1.5 text-xs text-gray-600 truncate">
                {item.type === 'video' ? <Film className="w-3 h-3 inline mr-1" /> : null}
                {item.caption || 'Sem título'}
              </div>
              {/* Remove button */}
              {editable && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {editable && (
        <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-navy-600 hover:text-navy-600 cursor-pointer transition-colors">
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : (
            <><ImagePlus className="w-4 h-4" /> Adicionar foto ou vídeo de referência</>
          )}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}

      {!editable && media.length === 0 && (
        <p className="text-sm text-gray-400 italic">Nenhuma referência visual adicionada.</p>
      )}
    </div>
  );
}
