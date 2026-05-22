import type {
  VisitationUpdateDTO,
} from "@shared/dto";
import type {
  VisitationRepository,
  VisitationWithItineraryPublicId,
} from "../repository.contract";
import type { ItineraryRepository } from "@/modules/itinerary/repository.contract";
import {
  VisitationNotFoundError,
  InvalidInputError,
} from "@shared/errors";
import { getEntityFromUpdateDTO } from "./mappers";
import { isValidVisitOrderNumber, hasMinuteLeft } from "./helpers";
import type { Prisma } from "@prisma/client";
export interface UsecaseUpdate {
  (
    visitationRepository: VisitationRepository,
    itineraryRepository: ItineraryRepository,
    visitationId: string,
    data: VisitationUpdateDTO,
  ): Promise<void>;
}

interface ValidateUpdate {
  (
    visitationRepository: VisitationRepository,
    currentVisitation: VisitationWithItineraryPublicId | null,
    data: VisitationUpdateDTO,
  ): Promise<VisitationWithItineraryPublicId>;
}

const validateUpdate: ValidateUpdate = async (
  visitationRepository,
  currentVisitation,
  data,
) => {
  if (!currentVisitation) {
    throw new VisitationNotFoundError();
  }

  if (data.visitOrder) {
    const isFreeOrder = await visitationRepository.isFreeOrder(
      currentVisitation.itineraryId,
      data.visitOrder,
    );

    if (!isValidVisitOrderNumber(data.visitOrder)) {
      throw new InvalidInputError({
        message:
          "Visitation must be a positive integer and smaller or equal to 10 and greater than 0",
      });
    }

    if (!isFreeOrder) {
      throw new InvalidInputError({
        message: `Visit order  ${data.visitOrder} is not free`,
      });
    }
  }

  const minutesSum = await visitationRepository.minutesSum(
    currentVisitation.itineraryId,
  );
  const dayMinutes = 24 * 60;
  if (
    minutesSum &&
    data.durationMinutes &&
    !hasMinuteLeft(minutesSum, data.durationMinutes)
  ) {
    throw new InvalidInputError({
      message: `This day left only ${dayMinutes - minutesSum} remaining minutes`,
    });
  }

  return currentVisitation;
};

export const usecaseUpdate: UsecaseUpdate = async (
  visitationRepository,
  _itineraryRepository,
  visitationId,
  data,
) => {
  const currentVisitation =
    await visitationRepository.findByPublicIdWithItineraryPublicId(
      visitationId,
    );
  const existingVisitation = await validateUpdate(
    visitationRepository,
    currentVisitation,
    data,
  );

  const visitationEntity: Prisma.VisitationUpdateInput = getEntityFromUpdateDTO(
    data,
  );

  await visitationRepository.update(existingVisitation.id, visitationEntity);
};
