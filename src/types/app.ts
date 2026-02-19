// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Dozenten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    email?: string;
    telefon?: string;
    fachgebiet?: string;
  };
}

export interface Teilnehmer {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    email?: string;
    telefon?: string;
    geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Raeume {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    raumname?: string;
    gebaeude?: string;
    kapazitaet?: number;
  };
}

export interface Kurse {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    enddatum?: string; // Format: YYYY-MM-DD oder ISO String
    max_teilnehmer?: number;
    preis?: number;
    dozent?: string; // applookup -> URL zu 'Dozenten' Record
    raum?: string; // applookup -> URL zu 'Raeume' Record
  };
}

export interface Anmeldungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer?: string; // applookup -> URL zu 'Teilnehmer' Record
    kurs?: string; // applookup -> URL zu 'Kurse' Record
    anmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    bezahlt?: boolean;
  };
}

export const APP_IDS = {
  DOZENTEN: '6997145691f611eedbf59937',
  TEILNEHMER: '69971456e7214ec5e9c49536',
  RAEUME: '699714573ff7e1acb4f487b6',
  KURSE: '699714578d208af990b3db9c',
  ANMELDUNGEN: '69971457f3bfe439d8ede9b5',
} as const;

// Helper Types for creating new records
export type CreateDozenten = Dozenten['fields'];
export type CreateTeilnehmer = Teilnehmer['fields'];
export type CreateRaeume = Raeume['fields'];
export type CreateKurse = Kurse['fields'];
export type CreateAnmeldungen = Anmeldungen['fields'];