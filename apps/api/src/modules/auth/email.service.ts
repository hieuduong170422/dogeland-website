import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('email.host');
    const port = config.get<number>('email.port');
    const user = config.get<string>('email.user');
    const pass = config.get<string>('email.pass');

    this.from = config.get<string>('email.from') ?? 'Dogeland <noreply@dogeland.vn>';
    this.appUrl = config.get<string>('app.appUrl') ?? 'http://localhost:3000';

    this.transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  }

  async sendVerification(to: string, username: string, token: string) {
    const link = `${this.appUrl}/auth/verify-email?token=${token}`;
    await this.send(to, 'Xác minh tài khoản Dogeland', this.verificationTemplate(username, link));
  }

  async sendPasswordReset(to: string, username: string, token: string) {
    const link = `${this.appUrl}/auth/reset-password?token=${token}`;
    await this.send(to, 'Đặt lại mật khẩu Dogeland', this.resetTemplate(username, link));
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  private verificationTemplate(username: string, link: string): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#eee;padding:40px;border-radius:8px">
        <h1 style="color:#4ade80">🌿 Dogeland</h1>
        <h2>Xác minh tài khoản</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Nhấn nút bên dưới để xác minh tài khoản của bạn. Link có hiệu lực trong 24 giờ.</p>
        <a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;font-weight:bold">
          Xác minh email
        </a>
        <p style="color:#999;font-size:12px">Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.</p>
      </div>
    `;
  }

  private resetTemplate(username: string, link: string): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#eee;padding:40px;border-radius:8px">
        <h1 style="color:#4ade80">🌿 Dogeland</h1>
        <h2>Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Nhấn nút bên dưới để đặt lại mật khẩu. Link có hiệu lực trong 3 giờ.</p>
        <a href="${link}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;font-weight:bold">
          Đặt lại mật khẩu
        </a>
        <p style="color:#999;font-size:12px">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
      </div>
    `;
  }
}
