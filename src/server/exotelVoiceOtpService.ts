/**
 * Forwarding shim for backward compatibility
 * All Exotel OTP verifications now use Exotel SMS exclusively.
 */

import { exotelSmsOtpService, ExotelSmsOtpService } from './exotelSmsOtpService';

export const exotelVoiceOtpService = {
  isConfigured: () => exotelSmsOtpService.isConfigured(),
  getDiagnosticStatus: () => exotelSmsOtpService.getDiagnosticStatus(),
  maskPhone: (phone: string) => exotelSmsOtpService.maskPhone(phone),
  normalizePhone: (phone: string) => exotelSmsOtpService.normalizePhone(phone),
  sendVoiceOtp: (params: any) => exotelSmsOtpService.sendSmsOtp(params),
  verifyVoiceOtp: (params: any) => exotelSmsOtpService.verifySmsOtp(params),
  verifyToken: (token: string, phone: string, purpose?: any) => exotelSmsOtpService.verifyToken(token, phone, purpose),
};

export class ExotelVoiceOtpService {
  public static getInstance() {
    return exotelSmsOtpService;
  }
}
