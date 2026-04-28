import type {
  VisitationCreateInput,
  VisitationUpdateInput,
} from "@modules/visitations/schemas";
import type { Visitation } from "@prisma/client";

export type VisitationCreateDTO = VisitationCreateInput & {
  itineraryId: bigint;
};

export type VisitationUpdateDTO = VisitationUpdateInput

export type VisitationResponseDTO = Omit<Visitation, "id" | "itineraryId"> & {
  id: string;
  itineraryId: string;
};
