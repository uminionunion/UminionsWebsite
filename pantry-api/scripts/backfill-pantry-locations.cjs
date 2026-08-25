const path = require('path');
const Database = require('better-sqlite3');

const dataDirectory = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
const database = new Database(path.join(dataDirectory, 'database.sqlite'));

const stateNames = {
  AL: ['USA', 'Alabama'], AK: ['USA', 'Alaska'], AZ: ['USA', 'Arizona'], AR: ['USA', 'Arkansas'],
  CA: ['USA', 'California'], CO: ['USA', 'Colorado'], CT: ['USA', 'Connecticut'], DE: ['USA', 'Delaware'],
  FL: ['USA', 'Florida'], GA: ['USA', 'Georgia'], HI: ['USA', 'Hawaii'], ID: ['USA', 'Idaho'],
  IL: ['USA', 'Illinois'], IN: ['USA', 'Indiana'], IA: ['USA', 'Iowa'], KS: ['USA', 'Kansas'],
  KY: ['USA', 'Kentucky'], LA: ['USA', 'Louisiana'], ME: ['USA', 'Maine'], MD: ['USA', 'Maryland'],
  MA: ['USA', 'Massachusetts'], MI: ['USA', 'Michigan'], MN: ['USA', 'Minnesota'], MS: ['USA', 'Mississippi'],
  MO: ['USA', 'Missouri'], MT: ['USA', 'Montana'], NE: ['USA', 'Nebraska'], NV: ['USA', 'Nevada'],
  NH: ['USA', 'New Hampshire'], NJ: ['USA', 'New Jersey'], NM: ['USA', 'New Mexico'], NY: ['USA', 'New York'],
  NC: ['USA', 'North Carolina'], ND: ['USA', 'North Dakota'], OH: ['USA', 'Ohio'], OK: ['USA', 'Oklahoma'],
  OR: ['USA', 'Oregon'], PA: ['USA', 'Pennsylvania'], RI: ['USA', 'Rhode Island'], SC: ['USA', 'South Carolina'],
  SD: ['USA', 'South Dakota'], TN: ['USA', 'Tennessee'], TX: ['USA', 'Texas'], UT: ['USA', 'Utah'],
  VT: ['USA', 'Vermont'], VA: ['USA', 'Virginia'], WA: ['USA', 'Washington'], WV: ['USA', 'West Virginia'],
  WI: ['USA', 'Wisconsin'], WY: ['USA', 'Wyoming'], DC: ['USA', 'District of Columbia'], PR: ['USA', 'Puerto Rico'],
  AB: ['Canada', 'Alberta'], BC: ['Canada', 'British Columbia'], MB: ['Canada', 'Manitoba'],
  NB: ['Canada', 'New Brunswick'], NL: ['Canada', 'Newfoundland and Labrador'], NS: ['Canada', 'Nova Scotia'],
  NT: ['Canada', 'Northwest Territories'], NU: ['Canada', 'Nunavut'], ON: ['Canada', 'Ontario'],
  PE: ['Canada', 'Prince Edward Island'], QC: ['Canada', 'Quebec'], SK: ['Canada', 'Saskatchewan'], YT: ['Canada', 'Yukon'],
  AGUASCALIENTES: ['Mexico', 'Aguascalientes'], 'BAJA CALIFORNIA': ['Mexico', 'Baja California'],
  'BAJA CALIFORNIA SUR': ['Mexico', 'Baja California Sur'], CAMPECHE: ['Mexico', 'Campeche'],
  CHIAPAS: ['Mexico', 'Chiapas'], CHIHUAHUA: ['Mexico', 'Chihuahua'], COAHUILA: ['Mexico', 'Coahuila'],
  COLIMA: ['Mexico', 'Colima'], DURANGO: ['Mexico', 'Durango'], GUANAJUATO: ['Mexico', 'Guanajuato'],
  GUERRERO: ['Mexico', 'Guerrero'], HIDALGO: ['Mexico', 'Hidalgo'], JALISCO: ['Mexico', 'Jalisco'],
  'MEXICO CITY': ['Mexico', 'Mexico City'], 'MEXICO STATE': ['Mexico', 'Mexico State'],
  MICHOACAN: ['Mexico', 'Michoacán'], MORELOS: ['Mexico', 'Morelos'], NAYARIT: ['Mexico', 'Nayarit'],
  'NUEVO LEON': ['Mexico', 'Nuevo León'], OAXACA: ['Mexico', 'Oaxaca'], PUEBLA: ['Mexico', 'Puebla'],
  QUERETARO: ['Mexico', 'Querétaro'], 'QUINTANA ROO': ['Mexico', 'Quintana Roo'],
  'SAN LUIS POTOSI': ['Mexico', 'San Luis Potosí'], SINALOA: ['Mexico', 'Sinaloa'], SONORA: ['Mexico', 'Sonora'],
  TABASCO: ['Mexico', 'Tabasco'], TAMAULIPAS: ['Mexico', 'Tamaulipas'], TLAXCALA: ['Mexico', 'Tlaxcala'],
  VERACRUZ: ['Mexico', 'Veracruz'], YUCATAN: ['Mexico', 'Yucatán'], ZACATECAS: ['Mexico', 'Zacatecas'],
  AGS: ['Mexico', 'Aguascalientes'], BCS: ['Mexico', 'Baja California Sur'],
  CAM: ['Mexico', 'Campeche'],
  CHIS: ['Mexico', 'Chiapas'], CHIH: ['Mexico', 'Chihuahua'], COAH: ['Mexico', 'Coahuila'], COL: ['Mexico', 'Colima'],
  DGO: ['Mexico', 'Durango'], GTO: ['Mexico', 'Guanajuato'], GRO: ['Mexico', 'Guerrero'],
  HGO: ['Mexico', 'Hidalgo'], JAL: ['Mexico', 'Jalisco'], CDMX: ['Mexico', 'Mexico City'], EDOMEX: ['Mexico', 'Mexico State'], MEX: ['Mexico', 'Mexico State'], MICH: ['Mexico', 'Michoacán'],
  MOR: ['Mexico', 'Morelos'], NAY: ['Mexico', 'Nayarit'], OAX: ['Mexico', 'Oaxaca'],
  PUE: ['Mexico', 'Puebla'], QRO: ['Mexico', 'Querétaro'], QROO: ['Mexico', 'Quintana Roo'],
  SLP: ['Mexico', 'San Luis Potosí'], SIN: ['Mexico', 'Sinaloa'], SON: ['Mexico', 'Sonora'], TAB: ['Mexico', 'Tabasco'],
  TAM: ['Mexico', 'Tamaulipas'], TAMPS: ['Mexico', 'Tamaulipas'], TLAX: ['Mexico', 'Tlaxcala'],
  VER: ['Mexico', 'Veracruz'], YUC: ['Mexico', 'Yucatán'], ZAC: ['Mexico', 'Zacatecas'],
};

const stateEntries = Object.entries(stateNames);
const mexicoStateEntries = stateEntries.filter(([, location]) => location[0] === 'Mexico');
const mexicoOverlappingCodes = [
  ['BC', ['Mexico', 'Baja California']],
  ['NL', ['Mexico', 'Nuevo León']],
];
const countryNames = ['Canada', 'Mexico', 'USA', 'US', 'United States'];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function classifyAddress(address, latitude, longitude) {
  const value = String(address || '').replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();
  const postalCode = '(?:\\s+(?:\\d{5}(?:-\\d{4})?|[A-Z]\\d[A-Z]\\s?\\d[A-Z]\\d))?';
  const countrySuffix = '(?:\\s+(?:Canada|Mexico|USA|US|United States))?';

  for (const [stateKey, location] of mexicoOverlappingCodes) {
    const statePattern = new RegExp(`(?:^|[\\s,])${stateKey}${postalCode}\\s+Mexico$`, 'i');
    if (statePattern.test(value)) return { country: location[0], state: location[1] };
  }

  // BC and NL are shared abbreviations. Coordinates disambiguate Mexican
  // Baja California/Nuevo Leon from Canadian British Columbia/Newfoundland.
  const overlap = value.match(/(?:^|[\s,])(BC|NL)(?:\s+(?:\d{5}(?:-\d{4})?|[A-Z]\d[A-Z]\s?\d[A-Z]\d))?$/i);
  if (overlap && Number.isFinite(latitude)) {
    if (latitude < 40) {
      return overlap[1].toUpperCase() === 'BC'
        ? { country: 'Mexico', state: 'Baja California' }
        : { country: 'Mexico', state: 'Nuevo León' };
    }
    return overlap[1].toUpperCase() === 'BC'
      ? { country: 'Canada', state: 'British Columbia' }
      : { country: 'Canada', state: 'Newfoundland and Labrador' };
  }

  for (const [stateKey, location] of mexicoStateEntries.sort((left, right) => right[0].length - left[0].length)) {
    const statePattern = new RegExp(`(?:^|[\\s,])${escapeRegExp(stateKey)}${postalCode}\\s+Mexico$`, 'i');
    if (statePattern.test(value)) return { country: location[0], state: location[1] };
  }

  for (const [stateKey, location] of stateEntries.sort((left, right) => right[0].length - left[0].length)) {
    const statePattern = new RegExp(`(?:^|[\\s,])${escapeRegExp(stateKey)}${postalCode}${countrySuffix}$`, 'i');
    if (statePattern.test(value)) return { country: location[0], state: location[1] };
  }

  const countryPattern = new RegExp(`(?:^|[\\s,])(${countryNames.map(escapeRegExp).join('|')})(?:$|[\\s,])`, 'i');
  const countryMatch = value.match(countryPattern);
  if (countryMatch) {
    const country = countryMatch[1].toLowerCase() === 'canada'
      ? 'Canada'
      : countryMatch[1].toLowerCase() === 'mexico'
        ? 'Mexico'
        : 'USA';
    return { country, state: null };
  }

  return null;
}

try {
  const columns = database.prepare('PRAGMA table_info(pantries)').all().map(column => column.name);
  if (!columns.includes('country')) database.exec('ALTER TABLE pantries ADD COLUMN country TEXT');
  if (!columns.includes('state')) database.exec('ALTER TABLE pantries ADD COLUMN state TEXT');

  const rows = database.prepare(`
    SELECT id, address, country, state, lat, lng
    FROM pantries
    WHERE country IS NULL OR country = '' OR country IN ('Canada', 'Mexico')
  `).all();
  const update = database.prepare('UPDATE pantries SET country = ?, state = COALESCE(?, state) WHERE id = ?');
  const classify = database.transaction(() => {
    let classified = 0;
    for (const row of rows) {
      const hasAmbiguousCode = /(?:^|[\s,])(BC|NL)(?:\s+(?:\d{5}(?:-\d{4})?|[A-Z]\d[A-Z]\s?\d[A-Z]\d))?$/i.test(String(row.address || '').trim());
      if (row.country && !hasAmbiguousCode) continue;
      const location = classifyAddress(row.address, Number(row.lat), Number(row.lng));
      if (!location) continue;
      update.run(location.country, location.state, row.id);
      classified += 1;
    }
    return classified;
  });

  const classified = classify();
  const unresolved = database.prepare("SELECT COUNT(*) AS count FROM pantries WHERE country IS NULL OR country = ''").get().count;
  console.log(`Pantry location backfill: classified ${classified}; unresolved ${unresolved}`);
} finally {
  database.close();
}
