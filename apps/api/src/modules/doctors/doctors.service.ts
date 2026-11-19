export type PublicWorkingHour = { weekday: number; start: string; end: string };
export type PublicTimeOff = { id: string; doctorId: string | null; startsAt: string; endsAt: string; reason: string | null };
export type PublicDoctor = {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  titleEn: string | null;
  specialty: string | null;
  specialtyEn: string | null;
  bio: string | null;
  bioEn: string | null;
  photoUrl: string | null;
  sipNumber: string | null;
  gender?: string | null;
  experienceYears: number | null;
  education: string[];
  serviceIds: string[];
  workingHours: PublicWorkingHour[];
  timeOffs?: PublicTimeOff[];
};
export interface DoctorsReader {
  listPublic(): Promise<PublicDoctor[]>;
  listPublicTimeOffs(): Promise<PublicTimeOff[]>;
}
export class DoctorsService {
  constructor(private readonly repository: DoctorsReader) {}
  listPublic() { return this.repository.listPublic(); }
  listPublicTimeOffs() { return this.repository.listPublicTimeOffs(); }
}
