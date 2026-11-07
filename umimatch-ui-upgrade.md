# UmiMatch Settings UI Upgrade Plan

## Problem Statement
The current UmiMatch settings UI is static and cluttered. It displays all possible image upload slots and the primary image selector regardless of whether images actually exist. This contradicts the desired UX of a clean, progressive interface.

## Goals & Requirements

### 1. Dynamic Image Slots (The "Red Section")
- **Initial State**: When a profile has no images, only the "Image 1" upload slot should be visible.
- **Progressive Disclosure**: Subsequent slots (Image 2, 3, 4, 5) must only appear one by one as the previous slot is filled.
- **Max Limit**: Stop at 5 images.
- **Behavior**: If an image is removed or replaced, the slots should update their visibility accordingly.

### 2. Conditional Priority Selector (The "Pink Section")
- **Visibility Rule**: The "Priority Image" dropdown must be hidden by default.
- **Trigger**: The selector should only become visible when the profile has **more than one** image uploaded.
- **Logic**: If 0 or 1 image exists, there is no "choice" to be made, so the UI should remain clean by hiding the dropdown.

## Implementation Strategy
1. **State Tracking**: Switched from `Object.keys` to `Object.entries(profile).filter(([key, value]) => key.startsWith('image') && value)` to ensure only slots with actual values are counted.
2. **Conditional Rendering**:
   - Wrapped the "Add new image" and "Existing image" rows in logic that checks the actual count of populated image slots.
   - Wrapped the `priority_image` select element in a conditional check that only renders if more than one image is present.
3. **Verification**:
   - Code implemented in `MainUhubFeatureV001ForMyProfileModal.tsx`.
   - Bundles rebuilt via `npm.cmd run build` in `includes/uhub`.
   - **Confirmed (1st check)**: Logic replaced `Object.keys` with `Object.entries` to avoid counting empty keys.
   - **Confirmed (2nd check)**: Verified that the `priority_image` dropdown and image slots are now strictly gated by the number of populated images.

