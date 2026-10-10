import type { Request, Response } from "express";
import cookieConfig from "../../config/cookie.config";
import {
  credentialsSchema,
  customerSignUpSchema,
  organizerSignUpSchema,
} from "../../validators/auth.validator";
import { OrganizerRole } from "../../generated/prisma";
import AppError from "../../errors/app-error";
import CustomerRepository from "../../repositories/customer.repository";
import AuthService from "./auth.service";
import OrganizerRepository from "../../repositories/organizer.repository";
import { ACCESS_EXPIRES_IN, ACCESS_SECRET, REFRESH_EXPIRES_IN, REFRESH_SECRET } from "../../config/env.config";
import { AuthPayload } from "../../interfaces/auth-payload.interface";
import { uploadProfilePicture } from "../cloudinary/cloudinary.service";
import CouponService from "../coupon/coupon.service";
import PointService from "../point/point.service";

const AuthController = {
  async signUpCustomer(req: Request, res: Response) {
    const input = customerSignUpSchema.parse(req.body);
    if (await CustomerRepository.findAuthCredentialsByEmail(input.email)) {
      throw new AppError("An account with this email already exists!", 409);
    }

    let referredById: string | undefined;
    if (input.referredByCode) {
      const referrer = await CustomerRepository.findByReferralCode(input.referredByCode);
      if (!referrer) throw new AppError("Referral code not found!", 400);
      referredById = referrer.id;
    }

    const profilePicture = req.file
      ? await uploadProfilePicture(req.file, input.email, input.userType)
      : undefined;

    const customer = await CustomerRepository.create({
      name: input.name,
      email: input.email,
      password: await AuthService.hashPassword(input.password),
      ...(profilePicture ? { profilePicture } : {}),
      referralCode: await AuthService.generateReferralCode(),
      ...(referredById
        ? {
            referredBy: { connect: { id: referredById } },
            coupons: { create: CouponService.createReferralCouponData() },
            pointRecords: { create: await PointService.createPointRecord(referredById) },
          }
        : {}),
    });

    
    const jwtPayload = {
      id: customer.id,
      email: customer.email,
      userType: input.userType,
    };

    const accessToken = AuthService.generateToken(
			jwtPayload,
			ACCESS_SECRET,
			ACCESS_EXPIRES_IN,
		);

    const refreshToken = AuthService.generateToken(
          jwtPayload,
          REFRESH_SECRET,
          REFRESH_EXPIRES_IN,
    );

    res.cookie("refresh-token", refreshToken, cookieConfig).send({
			message: "Customer sign up success!",
			data: {
        token: accessToken,
				user: customer
			},
		});
  },

  async signUpOrganizer(req: Request, res: Response) {
    const input = organizerSignUpSchema.parse(req.body);
    if (await OrganizerRepository.findAuthCredentialsByEmail(input.email)) {
      throw new AppError("An account with this email already exists!", 409);
    }

    const profilePicture = req.file
      ? await uploadProfilePicture(req.file, input.email, input.userType)
      : undefined;

    const organizer = await OrganizerRepository.create({
      name: input.name,
      email: input.email,
      password: await AuthService.hashPassword(input.password),
      ...(profilePicture ? { profilePicture } : {}),
      role: input.role as OrganizerRole ?? OrganizerRole.ADMIN, // Default role is "ADMIN" if not provided
    });

    const jwtPayload = {
      id: organizer.id,
      email: organizer.email,
      userType: input.userType,
      role: organizer.role,
    };

    const accessToken = AuthService.generateToken(
			jwtPayload,
			ACCESS_SECRET,
			ACCESS_EXPIRES_IN,
		);

    const refreshToken = AuthService.generateToken(
          jwtPayload,
          REFRESH_SECRET,
          REFRESH_EXPIRES_IN,
    );

    res.cookie("refresh-token", refreshToken, cookieConfig).send({
			message: "Organizer sign up success!",
			data: {
        token: accessToken,
				user: organizer
			},
		});
  },

  async signInCustomer(req: Request, res: Response) {
    const input = credentialsSchema.parse(req.body);
    
    const customer = await CustomerRepository.findAuthCredentialsByEmail(input.email);
    if(!customer) throw new AppError("Invalid email or password!", 401);

    const isPasswordValid = await AuthService.comparePassword(input.password, customer.password || "");
    if (!isPasswordValid) throw new AppError("Invalid email or password!", 401);

    const { password: p, ...safeUser } = customer;

    const jwtPayload = {
      id: customer.id,
      email: customer.email,
      userType: input.userType,
    };

    const accessToken = AuthService.generateToken(
      jwtPayload,
      ACCESS_SECRET,
      ACCESS_EXPIRES_IN,
    );

    const refreshToken = AuthService.generateToken(
          jwtPayload,
          REFRESH_SECRET,
          REFRESH_EXPIRES_IN,
    );

    res.cookie("refresh-token", refreshToken, cookieConfig).send({
			message: "Customer sign in success!",
			data: {
        token: accessToken,
				user: safeUser
			},
		});
  },

  async signInOrganizer(req: Request, res: Response) {
    const input = credentialsSchema.parse(req.body);
    const organizer = await OrganizerRepository.findAuthCredentialsByEmail(input.email);
    if (!organizer || !(await AuthService.comparePassword(input.password, organizer.password))) {
      throw new AppError("Invalid email or password!", 401);
    }

    if (input.role && input.role !== organizer.role) {
      throw new AppError("Organizer role mismatch!", 403);
    }

    const { password: p, ...safeUser } = organizer;

    const jwtPayload ={
      id: organizer.id,
      email: organizer.email,
      userType: input.userType,
      role: organizer.role,
    };

    const accessToken = AuthService.generateToken(
      jwtPayload,
      ACCESS_SECRET,
      ACCESS_EXPIRES_IN,
    );

    const refreshToken = AuthService.generateToken(
          jwtPayload,
          REFRESH_SECRET,
          REFRESH_EXPIRES_IN,
    );

    res.cookie("refresh-token", refreshToken, cookieConfig).send({
			message: "Organizer sign in success!",
			data: {
        token: accessToken,
				user: safeUser
      },
    });
  },

  async signOut(req: Request, res: Response) {
		if (!req.auth) throw new AppError("Unauthorized access!", 401);

		res.clearCookie("refresh-token", cookieConfig).send({
			message: "Sign out success!",
			data: null,
		});
	},
  
	async refreshToken(req: Request, res: Response) {
		const existingRefToken = req.cookies["refresh-token"];
		if (!existingRefToken) throw new AppError("Refresh token not found!", 401);

		const decoded = AuthService.verifyToken(
			existingRefToken,
			REFRESH_SECRET,
		) as AuthPayload;

		if (!decoded) throw new AppError("Refresh token invalid!", 401);

		const { iat, exp, ...payload } = decoded;

		const accessToken = AuthService.generateToken(
			payload,
			ACCESS_SECRET,
			ACCESS_EXPIRES_IN,
		);

		const refreshToken = AuthService.generateToken(
			payload,
			REFRESH_SECRET,
			REFRESH_EXPIRES_IN,
		);

		res.cookie("refresh-token", refreshToken, cookieConfig).send({
			message: "Sign in success!",
			data: {
				token: accessToken,
			},
		});
	},

	async getAuthCredential(req: Request, res: Response) {
		if (!req.auth) throw new AppError("Unauthorized access!", 401);

    let safeUser;
    if(req.auth.userType === "ORGANIZER") {
      safeUser = await OrganizerRepository.findById(String(req.auth.id));
      safeUser = safeUser ? { ...safeUser, userType: "ORGANIZER" } : null;
    } else if(req.auth.userType === "CUSTOMER") {
		  safeUser = await CustomerRepository.findById(String(req.auth.id));
      safeUser = safeUser ? { ...safeUser, userType: "CUSTOMER" } : null;
    }

		if (!safeUser) throw new AppError("User not found!", 404);

		res.send({
			message: "Auth credentials retrieved successfully!",
			data: safeUser,
		});
	},
};


export default AuthController;