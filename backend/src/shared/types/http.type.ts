import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";

export type HttpLocals = Record<string, unknown>;

export type HttpRequest<
  P = ParamsDictionary,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
> = ExpressRequest<P, unknown, ReqBody, ReqQuery, HttpLocals>;

export type HttpResponse<ResBody = unknown> = ExpressResponse<ResBody, HttpLocals>;