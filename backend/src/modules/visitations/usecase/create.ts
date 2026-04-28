import type {
  VisitationCreateDTO,
  VisitationResponseDTO,
} from "@shared/dto/visitation.dto";
import type { VisitationRepository } from "../repository.contract";
import {
  isValidVisitOrderNumber,
  hasMinuteLeft,
  pickByKeys,
} from "@shared/utils";
import {
  InvalidInputError,
  ItineraryNotFoundError,
  ConflictVisitationLimit,
} from "@shared/errors";
import type { ItineraryRepository } from "@modules/itineraries/repository.contract";

export interface UsecaseCreate {
  (
    visitationRepository: VisitationRepository,
    itineraryRepository: ItineraryRepository,
    data: VisitationCreateDTO,
  ): Promise<VisitationResponseDTO>;
}

export const usecaseCreate: UsecaseCreate = async (
  visitationRepository,
  itineraryRepository,
  data,
) => {
  const itinerary = await itineraryRepository.findById(data.itineraryId);
  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }

  const visitationAmount =
    await visitationRepository.findVisitationTotalByItineraryId(
      data.itineraryId,
    );

  if (visitationAmount + 1 > itinerary.dailyQuota) {
    throw new ConflictVisitationLimit({
      message: `Itinerary ${itinerary.id} is full`,
    });
  }

  if (data.visitOrder) {
    const isFreeOrder = await visitationRepository.isFreeOrder(
      data.itineraryId,
      data.visitOrder,
    );
    if (!isFreeOrder) {
      throw new InvalidInputError({
        message: `Visit order  ${data.visitOrder} is not free`,
      });
    }

    if (!isValidVisitOrderNumber(data.visitOrder)) {
      throw new InvalidInputError({
        message:
          "Visitation must be a positive integer and smaller or equal to 10 and greater than 0",
      });
    }
  }

  const minutesSum = await visitationRepository.minutesSum(data.itineraryId);
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

  const baseCreate = pickByKeys(data, [
    "durationMinutes",
    "isVisited",
    "priceCents",
    "scheduleTime",
    "visitOrder",
  ]);

  const visitation = await visitationRepository.create({
    ...baseCreate,
    itinerary: { connect: { id: data.itineraryId } },
  });

  const visitationResponse: VisitationResponseDTO = {
    ...visitation,
    id: String(visitation.id),
    itineraryId: String(visitation.itineraryId),
  };

  return visitationResponse;
};
