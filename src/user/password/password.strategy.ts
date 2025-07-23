import { randomInt } from 'crypto';

export interface IPasswordStrategy {
  generate(username: string): string;
}

export class AdminPasswordStrategy implements IPasswordStrategy {
  generate(username: string): string {
    const name = username
      .replace(/^(drg?)\.?\s*/i, '')
      .trim()
      .slice(0, 4)
      .toLowerCase();
    return `${name}.ADM#${randomInt(10000, 99999)}`;
  }
}

export class DoctorPasswordStrategy implements IPasswordStrategy {
  generate(username: string): string {
    const name = username
      .replace(/^(drg?)\.?\s*/i, '')
      .trim()
      .slice(0, 4)
      .toLowerCase();
    return `${name}.DCT#${randomInt(10000, 99999)}`;
  }
}

export class PharmacistPasswordStrategy implements IPasswordStrategy {
  generate(username: string): string {
    const name = username
      .replace(/^(drg?)\.?\s*/i, '')
      .trim()
      .slice(0, 4)
      .toLowerCase();
    return `${name}.FRM#${randomInt(10000, 99999)}`;
  }
}

export class StaffPasswordStrategy implements IPasswordStrategy {
  generate(username: string): string {
    const name = username
      .replace(/^(drg?)\.?\s*/i, '')
      .trim()
      .slice(0, 4)
      .toLowerCase();
    return `${name}.STF#${randomInt(10000, 99999)}`;
  }
}
