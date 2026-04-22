import type { HttpRequest, HttpResponse } from "@shared/types";
import type { NextFunction } from "express";
import { InvalidIdError } from "@shared/errors";

export const validateIdParams = (req: HttpRequest, res: HttpResponse, next: NextFunction): void => {
    const id = req.params.id;

    if(typeof id !== "string" || id.trim() === "" ){
        throw new InvalidIdError({ message: "Id must be a non-empty string" });
    }

    if(isNaN(Number(id)) || BigInt(id) === 0n){
        throw new InvalidIdError({ message: "Id must be a bigint convertable and greater than 0" });
    }

    next();
};