import { Document } from 'mongoose';
import { Request } from 'express';

interface UserType {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'guide' | 'lead-guide' | 'user';
  photo: string;
  id: string;
}

export default interface UserDocumentType extends UserType, Document {
  confirmPassword?: string;
  passwordResetToken?: string;
  passwordResetTokenTimeOut?: number;
  isDeleted: boolean;
  changedPasswordAt: number;
  authToken?: string;
  authTokenTimeOut?: number;
  isVerified: boolean;
  isAfter: (jwt: String) => boolean;
  createAuthToken: () => string;
  comparePassword: (
    candidatePassword: string,
    hashedPassword: string
  ) => boolean;
  createPasswordResetToken: () => string;
}

export interface IGetUserAuthInfoRequest extends Request {
  user?: UserType;
}
