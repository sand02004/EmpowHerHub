export enum Role {
  WOMAN = 'WOMAN',
  MENTOR = 'MENTOR',
  SPONSOR = 'SPONSOR',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_REVIEW = 'IN_REVIEW',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export namespace Prisma {
  export type Sql = any;
}
