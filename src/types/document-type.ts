export const DocumentType = {
  GR: 'GR',
  WT: 'WT',
  WI: 'WI',
  WO: 'WO',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

