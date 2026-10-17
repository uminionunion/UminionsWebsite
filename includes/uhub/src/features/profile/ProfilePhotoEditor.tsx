import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { notifyProfilePhotosChanged, type ProfilePhotoSaveResult } from '../../lib/profile-photo-events';

export type ProfilePhotoPurpose = 'profile' | 'cover';

interface ProfilePhotoEditorProps {
  userId: number;
  purpose: ProfilePhotoPurpose;
  currentImageUrl?: string | null;
  onClose: () => void;
  onSaved: (result: ProfilePhotoSaveResult) => void;
}

export function ProfilePhotoSuccessToast({ purpose, onDismiss }: { purpose: ProfilePhotoPurpose; onDismiss: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return <div role="status" className="fixed bottom-6 left-1/2 z-[1000010] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-green-500 bg-green-700 px-4 py-3 text-white shadow-xl">
    <span>{purpose === 'profile' ? 'Profile Picture Updated- Successfully!' : 'Cover Photo Updated- Successfully!'}</span>
    <button type="button" onClick={onDismiss} aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
  </div>;
}

export default function ProfilePhotoEditor({ userId, purpose, currentImageUrl, onClose, onSaved }: ProfilePhotoEditorProps) {
  const { user, updateUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const savingRef = useRef(false);
  const inputId = useId();
  const titleId = useId();
  const errorId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const label = purpose === 'profile' ? 'Profile Picture' : 'Cover Photo';

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const cancelSelection = () => {
    setFile(null);
    setPreviewReady(false);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    cancelSelection();
    if (!/\.(jpe?g|png)$/i.test(selected.name) || (selected.type && !['image/jpeg', 'image/png'].includes(selected.type))) {
      setError('Choose a JPG, JPEG, or PNG image.');
      return;
    }
    if (!selected.size) {
      setError('The selected image is empty. Choose another image.');
      return;
    }
    if (selected.size > 25 * 1024 ** 3) {
      setError('The image must be 25 GiB or smaller.');
      return;
    }
    setFile(selected);
  };

  const save = async () => {
    if (!file || !previewReady || savingRef.current) return;
    if (!user || user.id !== userId) {
      setError('Your session has changed. Sign in to this account before saving.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('purpose', purpose);
      const response = await fetch('/api/user-photos', { method: 'POST', credentials: 'include', body: formData });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : `Could not save ${label.toLowerCase()} (HTTP ${response.status}).`);
      if (!data?.photo?.id || typeof data.photo.url !== 'string' || !data.photo.url ||
        !(data.profile_image_url === null || typeof data.profile_image_url === 'string') ||
        !(data.cover_photo_url === null || typeof data.cover_photo_url === 'string') ||
        !(purpose === 'profile' ? data.profile_image_url : data.cover_photo_url)) {
        throw new Error('The server did not confirm a saved photo. Please try again.');
      }
      const result = data as ProfilePhotoSaveResult;
      updateUser({ profile_image_url: result.profile_image_url, cover_photo_url: result.cover_photo_url });
      notifyProfilePhotosChanged({ userId, profile_image_url: result.profile_image_url, cover_photo_url: result.cover_photo_url });
      onSaved(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not save ${label.toLowerCase()}. Please try again.`);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-[1000005] flex items-center justify-center bg-black/75 p-4" onClick={event => event.stopPropagation()}>
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={error ? errorId : undefined} aria-busy={saving}
      className="w-full max-w-3xl rounded-lg border border-gray-600 bg-black p-5 text-white shadow-xl"
      onKeyDown={event => {
        if (event.key === 'Escape') { event.stopPropagation(); if (!savingRef.current) onClose(); }
        if (event.key === 'Tab') {
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)'));
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-xl font-bold">Change {label}</h2>
        <button ref={closeRef} type="button" onClick={onClose} disabled={saving} aria-label="Close photo editor"><X className="h-5 w-5" /></button>
      </div>
      <div className={`grid items-center gap-5 ${file ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <figure className="flex flex-col items-center gap-2">
          <img src={currentImageUrl || (purpose === 'profile' ? '/defaultUminionUassets/defaultUminionUbadge.png' : '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg')}
            alt={`Current ${label.toLowerCase()}`} className={`h-40 w-full bg-gray-900 object-contain ${purpose === 'profile' ? 'max-w-40 rounded-full' : 'rounded-lg'}`} />
          <figcaption className="text-sm text-gray-300">Present {label}</figcaption>
        </figure>
        <div className="min-w-0 space-y-3">
          <label htmlFor={inputId} className="block font-semibold">Change {label}</label>
          <input ref={inputRef} id={inputId} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" disabled={saving}
            onChange={selectFile} className="block w-full min-w-0 text-sm file:mr-2 file:rounded file:border-0 file:bg-orange-400 file:px-2 file:py-2 file:text-black" />
          <p className="text-xs text-gray-300">JPG, JPEG, or PNG. Maximum 25 GiB.</p>
          {file && <div className="flex gap-2">
            <Button type="button" disabled={saving || !previewReady} onClick={() => void save()} className="bg-orange-400 text-black hover:bg-orange-500">{saving ? 'Saving…' : 'Save'}</Button>
            <Button type="button" variant="outline" disabled={saving} onClick={cancelSelection}>Cancel</Button>
          </div>}
          {!file && <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>}
        </div>
        {file && <figure className="flex min-w-0 flex-col items-center gap-2">
          {previewUrl && <img key={previewUrl} src={previewUrl} alt={`New ${label.toLowerCase()} preview`}
            className={`h-40 w-full bg-gray-900 object-contain ${purpose === 'profile' ? 'max-w-40 rounded-full' : 'rounded-lg'}`}
            onLoad={() => setPreviewReady(true)} onError={() => { setPreviewReady(false); setError('This image could not be opened. Choose a valid JPG, JPEG, or PNG image.'); }} />}
          <figcaption className="max-w-full break-all text-center text-sm text-gray-300">New preview: {file.name}</figcaption>
        </figure>}
      </div>
      {error && <p id={errorId} role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  </div>;
}
