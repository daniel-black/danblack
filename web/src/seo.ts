// Who the site is about, for structured data (schema.org JSON-LD) and author meta tags.
// Search engines use this to connect the site, its posts, and the profiles below to one person.

export const SITE_NAME = 'Dan Black';

export const PERSON = {
  '@type': 'Person',
  '@id': 'https://danblack.co/#person',
  name: 'Dan Black',
  alternateName: 'Daniel Black',
  givenName: 'Daniel',
  familyName: 'Black',
  url: 'https://danblack.co/',
  image: 'https://danblack.co/og.png',
  jobTitle: 'Software Engineer',
  worksFor: { '@type': 'Organization', name: 'True Anomaly', url: 'https://www.trueanomaly.space' },
  homeLocation: { '@type': 'Place', name: 'Denver, Colorado' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Minnesota, Twin Cities' },
  sameAs: ['https://github.com/daniel-black', 'https://www.linkedin.com/in/danielblack2022'],
} as const;

/** Profiles that are also me; linked from every page with rel="me". */
export const PROFILES = PERSON.sameAs;
