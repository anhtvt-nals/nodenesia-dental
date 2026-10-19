export type PublicServiceFaq = { question: string; questionEn: string | null; answer: string; answerEn: string | null };
export type PublicService = {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  shortDesc: string;
  shortDescEn: string | null;
  description: string;
  descriptionEn: string | null;
  zone: string;
  category: string;
  durationMinutes: number;
  priceFrom: string;
  priceTo: string | null;
  priceNote: string | null;
  priceNoteEn: string | null;
  faqs: PublicServiceFaq[];
};
export interface ServicesReader { listPublic(): Promise<PublicService[]>; }
export class ServicesService { constructor(private readonly repository: ServicesReader) {} listPublic() { return this.repository.listPublic(); } }
