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
	userType: "ORGANIZER";
	role: OrganizerRole;
	iat?: number;
	exp?: number;
}

export type AuthPayload = AuthCustomerPayload | AuthOrganizerPayload;

declare global {
	namespace Express {
		interface Request {
			auth: AuthPayload;
		}
	}
}