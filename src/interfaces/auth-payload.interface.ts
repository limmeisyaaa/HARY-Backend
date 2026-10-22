import { OrganizerRole } from "../generated/prisma";

export interface AuthCustomerPayload {
	id: string;
	email: string;
	userType: "CUSTOMER";
	iat?: number;
	exp?: number;
}

export interface AuthOrganizerPayload {
	id: string;
	email: string;
	eventOrganizerName: string;
	userType: "ORGANIZER";
	role: OrganizerRole;
	iat?: number;
	exp?: number;
}

export type AuthPayload = AuthOrganizerPayload | AuthCustomerPayload;

declare global {
	namespace Express {
		interface Request {
			auth: AuthPayload;
		}
	}
}