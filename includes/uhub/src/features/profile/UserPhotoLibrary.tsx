import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Photo {
  id: number;
  url: string;
  caption: string;
  purpose: 'profile' | 'cover' | 'library';
}

export interface PhotoSelection {
  profile_image_url: string | null;
  cover_photo_url: string | null;
}

export function PhotoZoom({ url, caption = '', onClose }: { url: string; caption?: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  return <div role="dialog" aria-label="Photo zoom" className="fixed inset-0 z-[100020] bg-black/90 flex items-center justify-center p-6" onClick={event => { event.stopPropagation(); onClose(); }}>
    <div className="relative max-w-[90vw] max-h-[90vh] overflow-y-auto p-8" onClick={event => event.stopPropagation()}>
      <Button aria-label="Close photo" className="absolute right-0 top-0" onClick={onClose}><X /></Button>
      {loading && <Loader2 role="status" aria-label="Loading image" className="animate-spin mx-auto" />}
      {error && <p role="alert" className="text-red-400">{error}</p>}
      <img src={url} alt="Enlarged photo" className="max-w-full max-h-[72vh] object-contain" onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError('Unable to load this image.'); }} />
      <p className="whitespace-pre-wrap break-words mt-4 text-white">{caption}</p>
    </div>
  </div>;
}

export default function UserPhotoLibrary({ userId, ownProfile, editMode, onSelection }: {
  userId: number; ownProfile: boolean; editMode: boolean; onSelection: (selection: PhotoSelection) => void;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState<Photo | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const selectionRef = useRef(onSelection);
  selectionRef.current = onSelection;
  const lifetime = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener('uhub:profile-photos-changed', refresh);
    return () => window.removeEventListener('uhub:profile-photos-changed', refresh);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const urls: string[] = [];
    setLoading(true);
    setError('');
    setPhotos([]);
    setThumbnails({});
    const load = async () => {
      try {
        const response = await fetch(`/api/user-photos/${userId}`, { signal: controller.signal, cache: 'no-store', credentials: 'include' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load the photo library');
        if (controller.signal.aborted) return;
        const records: Photo[] = data.photos;
        selectionRef.current(data);
        setPhotos(records);
        const loaded: Record<number, string> = {};
        // Keep thumbnail work local to this view, with no retained global decoded-image cache.
        for (const photo of records) {
          try {
            const image = await fetch(`/api/user-photos/image/${photo.id}/thumbnail`, { signal: controller.signal, cache: 'no-store' });
            if (!image.ok) throw new Error('Unable to load a photo preview');
            const blob = await image.blob();
            if (controller.signal.aborted) return;
            const url = URL.createObjectURL(blob);
            urls.push(url);
            loaded[photo.id] = url;
            setThumbnails({ ...loaded });
          } catch (failure) {
            if (controller.signal.aborted) return;
            console.error('[PHOTO LIBRARY] Preview retrieval failed:', photo.id, failure);
            setError('Some image previews could not be loaded. Close and reopen this profile to retry.');
          }
        }
      } catch (failure) {
        if (controller.signal.aborted) return;
        console.error('[PHOTO LIBRARY] Retrieval failed:', failure);
        setError(failure instanceof Error ? failure.message : 'Unable to retrieve photos');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => {
      controller.abort();
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [userId, revision]);

  const updateSelection = (data: PhotoSelection) => {
    selectionRef.current(data);
    window.dispatchEvent(new CustomEvent('uhub:profile-photos-changed', { detail: { userId, ...data } }));
  };
  const mutate = async (url: string, options: RequestInit) => {
    const response = await fetch(url, { ...options, credentials: 'include', signal: lifetime.current?.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Photo update failed');
    return data;
  };
  const upload = async (files: File[]) => {
    if (!files.length) return;
    if (photos.length + files.length > 100 || files.some(file => !/\.(jpe?g|png)$/i.test(file.name) || file.size > 25 * 1024 ** 3)) {
      setError('Choose JPG, JPEG or PNG, up to 25GB each, with at most 100 photos in your library.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('purpose', 'library');
      files.forEach(file => body.append('media', file));
      const data = await mutate('/api/user-photos', { method: 'POST', body });
      updateSelection(data);
    } catch (failure) {
      if (!lifetime.current?.signal.aborted) {
        console.error('[PHOTO LIBRARY] Upload failed:', failure);
        setError(failure instanceof Error ? failure.message : 'Photo upload failed');
      }
    } finally { if (!lifetime.current?.signal.aborted) setBusy(false); }
  };
  const save = async (remove: boolean) => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const data = await mutate(`/api/user-photos/${selected.id}`, remove ? { method: 'DELETE' } : {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption }),
      });
      setSelected(null);
      if (remove) updateSelection(data);
      else setRevision(value => value + 1);
    } catch (failure) {
      if (!lifetime.current?.signal.aborted) {
        console.error('[PHOTO LIBRARY] Update failed:', failure);
        setError(failure instanceof Error ? failure.message : 'Photo update failed');
      }
    } finally { if (!lifetime.current?.signal.aborted) setBusy(false); }
  };
  return <>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold">Photo Library</h3>
      {ownProfile && <Button size="icon" variant="outline" aria-label="Add photos" disabled={busy || loading} onClick={() => input.current?.click()}><Plus className="h-4 w-4" /></Button>}
      <input ref={input} hidden type="file" multiple accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={event => { void upload(Array.from(event.target.files || [])); event.target.value = ''; }} />
    </div>
    {(loading || busy) && <Loader2 role="status" aria-label={busy ? 'Saving photos' : 'Loading photo library'} className="animate-spin mx-auto mb-3" />}
    {error && <p role="alert" className="text-red-400 text-sm mb-3">{error}</p>}
    {!loading && !photos.length && <p className="text-muted-foreground text-sm">No uploaded photos yet.</p>}
    <div className="grid grid-cols-2 gap-2">
      {photos.map(photo => <button key={photo.id} disabled={busy} onClick={event => {
        event.stopPropagation();
        if (editMode && ownProfile) { setSelected(photo); setCaption(photo.caption); }
        else setZoom(photo);
      }} aria-label={editMode && ownProfile ? 'Edit photo' : 'Zoom photo'} className="border rounded bg-gray-950 h-28 overflow-hidden">
        {thumbnails[photo.id] ? <img src={thumbnails[photo.id]} alt={photo.caption || 'User photo'} className="h-full w-full object-contain" /> : loading ? <Loader2 className="animate-spin mx-auto" /> : <span className="text-sm text-red-400">Preview unavailable</span>}
      </button>)}
    </div>
    {zoom && <PhotoZoom key={zoom.id} url={zoom.url} caption={zoom.caption} onClose={() => setZoom(null)} />}
    {selected && ownProfile && editMode && <div role="dialog" aria-label="Edit library photo" className="fixed inset-0 z-[100015] bg-black/80 flex items-center justify-center p-6" onClick={event => event.stopPropagation()}>
      <div className="bg-black border rounded p-5 max-w-lg w-full">
        <img src={thumbnails[selected.id]} alt="Selected photo" className="max-h-60 w-full object-contain mb-3" />
        <textarea aria-label="Photo caption" value={caption} onChange={event => setCaption(Array.from(event.target.value).slice(0, 1000).join(''))} className="w-full bg-gray-900 border p-2" disabled={busy} />
        <p className="text-xs mb-3">{Array.from(caption).length} / 1,000 characters</p>
        <div className="flex gap-2">
          <Button disabled={busy} onClick={() => void save(false)} className="bg-orange-400 text-black">Save Caption</Button>
          <Button disabled={busy} onClick={() => void save(true)} className="bg-red-700 text-white">Delete Image</Button>
          <Button disabled={busy} variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
        </div>
      </div>
    </div>}
  </>;
}
