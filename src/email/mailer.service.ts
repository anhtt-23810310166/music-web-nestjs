import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);
  private isEnabled: boolean;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    this.isEnabled = !!(smtpHost && smtpPort && smtpUser && smtpPass);

    if (this.isEnabled) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      this.logger.warn(
        'Email configuration not complete. Email features disabled.',
      );
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationToken: string,
  ): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn('Email service disabled, skipping verification email');
      return false;
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from:
        this.configService.get<string>('EMAIL_FROM') || 'noreply@musicweb.com',
      to: email,
      subject: 'Xác thực email - Music Web',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Chào mừng bạn đến với Music Web!</h2>
          <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấp vào nút bên dưới để xác thực email của bạn:</p>
          <a href="${verificationLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Xác thực Email
          </a>
          <p>Hoặc sao chép và dán liên kết sau vào trình duyệt:</p>
          <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          <p style="color: #999; font-size: 12px;">Liên kết này sẽ hết hạn sau 24 giờ.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu xác thực email, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}: ${error.message}`,
      );
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn('Email service disabled, skipping password reset email');
      return false;
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from:
        this.configService.get<string>('EMAIL_FROM') || 'noreply@musicweb.com',
      to: email,
      subject: 'Đặt lại mật khẩu - Music Web',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Đặt lại Mật khẩu
          </a>
          <p>Hoặc sao chép và dán liên kết sau vào trình duyệt:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p style="color: #999; font-size: 12px;">Liên kết này sẽ hết hạn sau 1 giờ.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
      );
      return false;
    }
  }
}
