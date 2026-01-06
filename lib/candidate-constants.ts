export const CANDIDATE_STAGES = [
  "NEW",
  "SOURCED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const

export const CANDIDATE_SOURCES = [
  "INTERNAL",
  "LINKEDIN",
  "EMAIL",
  "JOB_BOARD",
  "REFERRAL",
  "OTHER",
] as const

export type CandidateStageValue = (typeof CANDIDATE_STAGES)[number]
export type CandidateSourceValue = (typeof CANDIDATE_SOURCES)[number]

