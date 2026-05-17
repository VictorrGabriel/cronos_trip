import type {
  VisitationResponseDTO,
  VisitationUpdateDTO,
} from "@shared/dto/visitation.dto";
import type { VisitationRepository } from "../repository.contract";
import type { ItineraryRepository } from "@modules/itineraries/repository.contract";
import {
  ItineraryNotFoundError,
  VisitationNotFoundError,
  InvalidInputError,
} from "@shared/errors";
import { cleanByAllowedKeys } from "@shared/utils/index";
import { isValidVisitOrderNumber, hasMinuteLeft } from "@shared/utils";
import type { Prisma } from "@prisma/client";
export interface UsecaseUpdate {
  (
    visitationRepository: VisitationRepository,
    itineraryRepository: ItineraryRepository,
    visitationId: string,
    data: VisitationUpdateDTO,
  ): Promise<void>;
}

export const usecaseUpdate: UsecaseUpdate = async (
  visitationRepository,
  itineraryRepository,
  visitationId,
  data,
) => {
  const currentVisitation = await visitationRepository.findById(visitationId);
  if (!currentVisitation) {
    throw new VisitationNotFoundError();
  }

  const itinerary = await itineraryRepository.findById(currentVisitation.itineraryId);

  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }

  if (data.visitOrder) {
    const isFreeOrder = await visitationRepository.isFreeOrder(
      currentVisitation.itineraryId,
      data.visitOrder,
    );

    if (!isValidVisitOrderNumber) {
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

  const minutesSum = await visitationRepository.minutesSum(currentVisitation.itineraryId);
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

  const baseUpdate = cleanByAllowedKeys(data, [
    "durationMinutes",
    "isVisited",
    "priceCents",
    "scheduleTime",
    "visitOrder",
  ]);

  const visitationEntity: Prisma.VisitationUpdateInput = baseUpdate;

  await visitationRepository.update(currentVisitation.id, visitationEntity);
};
