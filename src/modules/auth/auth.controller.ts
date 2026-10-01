import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error";
import { CustomerRepository } from "../../repositories/customer.repository";
import { OrganizerRepository } from "../../repositories/organizer.repository";
import {
  generateAccessToken,
  hashPassword,
  verifyPassword,
} from "./auth.service";
import {
  credentialsSchema,
  customerSignUpSchema,
  organizerSignUpSchema,
} from "../../validators/auth.validator";
import { generateReferralCode } from "../../utils/secrete.key";

const customerRepository = new CustomerRepository();
const organizerRepository = new OrganizerRepository();

const AuthController = {
  async signUpCustomer(req: Request, res: Response) {
    const input = customerSignUpSchema.parse(req.body);
    if (await customerRepository.findByEmail(input.email)) {
      throw new AppError("An account with this email already exists!", 409);
    }

    let referredById: string | undefined;
    if (input.referredByCode) {
      const referrer = await customerRepository.findByReferralCode(input.referredByCode);
      if (!referrer) throw new AppError("Referral code not found!", 400);
      referredById = referrer.id;
    }

    const customer = await customerRepository.create({
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password),
      referralCode: generateReferralCode(),
      ...(referredById ? { referredBy: { connect: { id: referredById } } } : {}),
    });
    const token = generateAccessToken({
      id: customer.id,
      email: customer.email,
      userType: "CUSTOMER",
    });

    res.status(201).json({
      message: "Customer sign up success!",
      data: {
        token,
        user: { id: customer.id, name: customer.name, email: customer.email },
      },
    });
  },

  async signUpOrganizer(req: Request, res: Response) {
    const input = organizerSignUpSchema.parse(req.body);
    if (await organizerRepository.findByEmail(input.email)) {
      throw new AppError("An account with this email already exists!", 409);
    }

    const organizer = await organizerRepository.create({
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password),
      role: input.role ?? "ADMIN", // Default role is "ADMIN" if not provided
    });

    const token = generateAccessToken({
      id: organizer.id,
      email: organizer.email,
      userType: "ORGANIZER",
      role: organizer.role,
    });

    res.status(201).json({
      message: "Organizer sign up success!",
      data: {
        token,
        user: {
          id: organizer.id,
          name: organizer.name,
          email: organizer.email,
          role: organizer.role,
        },
      },
    });
  },

  async signInCustomer(req: Request, res: Response) {
    const input = credentialsSchema.parse(req.body);
    const customer = await customerRepository.findByEmail(input.email);
    if (!customer || !(await verifyPassword(input.password, customer.password))) {
      throw new AppError("Invalid email or password!", 401);
    }

    const token = generateAccessToken({
      id: customer.id,
      email: customer.email,
      userType: "CUSTOMER",
    });

    res.status(200).json({
      message: "Customer sign in success!",
      data: { token, user: { id: customer.id, name: customer.name, email: customer.email } },
    });
  },

  async signInOrganizer(req: Request, res: Response) {
    const input = credentialsSchema.parse(req.body);
    const organizer = await organizerRepository.findByEmail(input.email);
    if (!organizer || !(await verifyPassword(input.password, organizer.password))) {
      throw new AppError("Invalid email or password!", 401);
    }

    if (input.role && input.role !== organizer.role) {
      throw new AppError("Organizer role mismatch!", 403);
    }

    const token = generateAccessToken({
      id: organizer.id,
      email: organizer.email,
      userType: "ORGANIZER",
      role: organizer.role,
    });

    res.status(200).json({
      message: "Organizer sign in success!",
      data: {
        token,
        user: {
          id: organizer.id,
          name: organizer.name,
          email: organizer.email,
          role: organizer.role,
        },
      },
    });
  },
};

export default AuthController;