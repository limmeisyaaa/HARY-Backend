import bcrypt from "bcryptjs";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import {
  ACCESS_EXPIRES_IN,
  SALT_ROUNDS,
} from "../../config/env.config";
import { randomBytes } from "node:crypto";

const AuthService = {
	async hashPassword(password: string) {
		return await bcrypt.hash(password, Number(SALT_ROUNDS));
	},

	async comparePassword(password: string, hashedPassword: string) {
		return await bcrypt.compare(password, hashedPassword);
	},

	async generateReferralCode(){
		return randomBytes(4).toString("hex").toUpperCase();
	},

	generateToken(payload: JwtPayload, secret: string, expiresIn: string) {
		return jwt.sign(payload, secret, { expiresIn } as SignOptions);
	},

	verifyToken(token: string, secret: string) {
		return jwt.verify(token, secret);
	},
};

export default AuthService;