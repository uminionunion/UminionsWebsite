# UmiMatch Goal & Functional Specification

## Core Concept
UmiMatch is a Tinder-style matching engine designed to connect users based on mutual attraction, shared interests, and geographic proximity. The system follows a "Provider $\rightarrow$ Consumer $\rightarrow$ Connection" lifecycle.

## 1. The Provider: Profile Management
Users provide the "marketing materials" for their profile via the Settings menu.
- **Dynamic Image Slots**: A progressive UI that allows up to 5 image uploads. Slots appear one-by-one as images are added to maintain a clean interface.
- **Priority Selection**: Users can designate one of their uploaded images as the "Primary" image, which is the first thing other users see.
- **Identity & Location**: Users define their gender, who they are interested in, their bio, and their physical location (lat/lng) for distance-based filtering.

## 2. The Consumer: Discovery & Swiping
The Discovery feed is the primary engine for finding matches.
- **Filtered Retrieval**: The system retrieves candidates who are enrolled, not yet swiped, and within the user's `max_distance`.
- **The Swipe Card**: Users see a profile card. To create a high-quality experience, the card allows users to cycle through all available uploaded images (1-5) rather than just a single photo.
- **Decision**: Users "Like" or "Skip" a profile.

## 3. The Connection: Matching & Chat
Connections are governed by strict database reciprocity.
- **The Match**: A match is created only when two users have both "Liked" each other. This is verified via a reciprocal query in the `UmiMatchSwipes` table.
- **The Permission Gate**: A match acts as the exclusive key to unlock communication. Users can only message each other if a match exists.
- **The Conversation**: Matches can exchange messages through the `UmiMatchMessages` system.

## 4. The Kill-Switch: Unmatching
Users have total control over their connections.
- **Action**: Clicking "Unmatch" triggers a permanent disconnect.
- **Database Purge**:
    - Deletes reciprocal "Like" records from `UmiMatchSwipes`.
    - Wipes the entire message history from `UmiMatchMessages`.
- **Result**: The match is removed from both users' lists, and the permission to communicate is revoked.

## 5. Database Engine Summary
- **Identity**: `users` $\rightarrow$ Basic account info.
- **Profiles**: `UmiMatchProfiles` $\rightarrow$ Bio, location, and 5 image slots.
- **State**: `UmiMatchSwipes` $\rightarrow$ Tracks Likes/Skips and manages the "Discovery" exclusion list.
- **Communication**: `UmiMatchMessages` $\rightarrow$ Stores the conversation history for matched pairs.
