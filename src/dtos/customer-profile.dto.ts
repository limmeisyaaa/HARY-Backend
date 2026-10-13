import type { Customer } from "../generated/prisma";

type CustomerProfileSource = Pick<
  Customer,
  "id" | "name" | "email" | "profilePicture" | "referralCode" | "createdAt" | "updatedAt"
>;

export class CustomerProfileResponseDTO {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  referralCode: string;
  point: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(customer: CustomerProfileSource, point: number) {
    this.id = customer.id;
    this.name = customer.name;
    this.email = customer.email;
    this.profilePicture = customer.profilePicture ?? null;
    this.referralCode = customer.referralCode;
    this.point = point;
    this.createdAt = customer.createdAt;
    this.updatedAt = customer.updatedAt;
  }
}