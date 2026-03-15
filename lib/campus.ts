import { Campus, CampusInfo } from './types'

export const CAMPUS_CONFIG: Record<Campus, CampusInfo> = {
  anu: {
    id:    'anu',
    name:  'Africa Nazarene University',
    short: 'ANU',
    emoji: '🏫',
    color: '#FF2D55',
  },
  uon: {
    id:    'uon',
    name:  'University of Nairobi',
    short: 'UoN',
    emoji: '🎓',
    color: '#0A84FF',
  },
  strath: {
    id:    'strath',
    name:  'Strathmore University',
    short: 'Strath',
    emoji: '⭐',
    color: '#BF5AF2',
  },
  ku: {
    id:    'ku',
    name:  'Kenyatta University',
    short: 'KU',
    emoji: '🦁',
    color: '#FF9F0A',
  },
  other: {
    id:    'other',
    name:  'Other Campus',
    short: 'Other',
    emoji: '🏛️',
    color: '#30D158',
  },
}

export const ALL_CAMPUSES = Object.values(CAMPUS_CONFIG)

/** Detect campus from subdomain → localStorage fallback → default ANU */
export function detectCampus(): Campus {
  if (typeof window === 'undefined') return 'anu'

  const hostname  = window.location.hostname
  const subdomain = hostname.split('.')[0].toLowerCase()
  const valid: Campus[] = ['anu', 'uon', 'strath', 'ku']

  if (valid.includes(subdomain as Campus)) return subdomain as Campus

  const stored = localStorage.getItem('gossi_campus') as Campus
  if (stored && valid.includes(stored)) return stored

  return 'anu'
}

export function setCampusLocally(campus: Campus): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('gossi_campus', campus)
}

export function getCampusInfo(campus: Campus): CampusInfo {
  return CAMPUS_CONFIG[campus] ?? CAMPUS_CONFIG.other
}
