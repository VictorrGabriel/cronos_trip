import type {
  VisitationCreateInput,
  VisitationUpdateInput,
} from "@/modules/visitation/schemas";
import type { Visitation } from "@prisma/client";

export type VisitationCreateDTO = VisitationCreateInput & {
  itineraryId: string;
};

export type VisitationUpdateDTO = VisitationUpdateInput

export type VisitationResponseDTO = Omit<Visitation, "id" | "itineraryId" | "publicId"> & {
  id: string;
  itineraryId: string;
};
