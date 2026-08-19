
import L from 'leaflet';
import { Pantry, PantryType, Politician, Candidate } from './types';

const createIcon = (color: string, shape: string = 'default') => {
    // Using a simple trick for shape: different icon URLs.
    // For a real app, you'd use custom SVG icons.
    // These URLs point to different colored markers from a public repo.
    // The shape is simulated by using different marker sets if available, but here we just vary color.
    // A better approach would be L.divIcon with custom HTML/SVG.
    
    // For simplicity, we'll use different colors for now.
    // Shape differentiation is complex without custom SVG assets.
    // Let's map types to colors.
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const iconColors = ['red', 'orange', 'yellow', 'violet', 'grey', 'gold', 'blue', 'purple'];

const pantryTypeColors: Record<PantryType, string> = {
    food: 'green',
    clothing: 'blue',
    resource: 'purple', // light-purple is not a standard color name in the marker set
    library: 'black',
};

const typeIcons: Record<PantryType, L.Icon> = {
    food: createIcon(pantryTypeColors.food),
    clothing: createIcon(pantryTypeColors.clothing),
    resource: createIcon(pantryTypeColors.resource),
    library: createIcon(pantryTypeColors.library),
};

export const getIconForPantry = (pantry: Pantry): L.Icon => {
    return typeIcons[pantry.type] || createIcon('blue'); // Default to blue
};

const coloredIcons: Record<string, L.Icon> = iconColors.reduce((acc, color) => {
    acc[color] = createIcon(color);
    return acc;
}, {});

export const getRandomIcon = (type: PantryType): L.Icon => {
    const availableColors = iconColors.filter(c => c !== pantryTypeColors[type]);
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const randomColor = availableColors[randomIndex];
    return coloredIcons[randomColor];
};

const politicianIcons = {
    'House': createIcon('grey'),
    'Senate': createIcon('black'),
};

export const getIconForPolitician = (politician: Politician): L.Icon => {
    return politician.office === 'House' ? politicianIcons.House : politicianIcons.Senate;
};

const candidateIcon = createIcon('gold');

export const getIconForCandidate = (candidate: Candidate): L.Icon => {
    return candidateIcon;
};
