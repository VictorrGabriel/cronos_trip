import type {
  VisitationCreateDTO,
  VisitationResponseDTO,
} from "@shared/dto/visitation.dto";
import type { VisitationRepository } from "../repository.contract";
import {
  isValidVisitOrderNumber,
  hasMinuteLeft,
  pickByKeys,
  customNanoId,
  buildVisitationResponseDTO,
} from "@shared/utils";
import {
  InvalidInputError,
  ItineraryNotFoundError,
  ConflictVisitationLimit,
} from "@shared/errors";
import type { ItineraryRepository } from "@modules/itineraries/repository.contract";
import type { Itinerary } from "@prisma/client";

export interface UsecaseCreate {
  (
    visitationRepository: VisitationRepository,
    itineraryRepository: ItineraryRepository,
    data: VisitationCreateDTO,
  ): Promise<VisitationResponseDTO>;
}

interface ValidateCreate {
  (
    visitationRepository: VisitationRepository,
    data: VisitationCreateDTO,
    itinerary: Itinerary | null,
  ): Promise<Itinerary>;
}

const validateCreate: ValidateCreate = async (
  visitationRepository,
  data,
  itinerary,
) => {
  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }

  const visitationAmount =
    await visitationRepository.findVisitationTotalByItineraryId(itinerary.id);

  if (visitationAmount + 1 > itinerary.dailyQuota) {
    throw new ConflictVisitationLimit({
      message: `Itinerary ${itinerary.publicId} is full`,
    });
  }

  if (data.visitOrder) {
    const isFreeOrder = await visitationRepository.isFreeOrder(
      itinerary.id,
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

  const minutesSum = await visitationRepository.minutesSum(itinerary.id);
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

  return itinerary;
};

export const usecaseCreate: UsecaseCreate = async (
  visitationRepository,
  itineraryRepository,
  data,
) => {
  const itinerary = await itineraryRepository.findByPublicId(data.itineraryId);
  const existingItinerary = await validateCreate(
    visitationRepository,
    data,
    itinerary,
  );

  const baseCreate = pickByKeys(data, [
    "durationMinutes",
    "isVisited",
    "priceCents",
    "scheduleTime",
    "visitOrder",
  ]);

  const publicId = customNanoId();

  const visitation = await visitationRepository.create({
    ...baseCreate,
    publicId,
    itinerary: { connect: { id: existingItinerary.id } },
  });

  const visitationResponse: VisitationResponseDTO = buildVisitationResponseDTO(
    visitation,
    existingItinerary.publicId,
  );

  return visitationResponse;
};
