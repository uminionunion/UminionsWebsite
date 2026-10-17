export const PROFILE_PHOTOS_CHANGED_EVENT = 'uhub:profile-photos-changed';

export interface ProfilePhotosChangedDetail {
  userId: number;
  profile_image_url?: string | null;
  cover_photo_url?: string | null;
}

export interface ProfilePhotoSaveResult {
  photo: { id: number; url: string; caption?: string | null };
  profile_image_url: string | null;
  cover_photo_url: string | null;
}

export function notifyProfilePhotosChanged(detail: ProfilePhotosChangedDetail) {
  window.dispatchEvent(new CustomEvent<ProfilePhotosChangedDetail>(PROFILE_PHOTOS_CHANGED_EVENT, { detail }));
}
