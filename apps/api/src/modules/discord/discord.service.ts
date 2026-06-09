import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

const DISCORD_API = 'https://discord.com/api/v10';

@Injectable()
export class DiscordService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {
    this.clientId = this.config.get<string>('app.discordClientId') ?? '';
    this.clientSecret = this.config.get<string>('app.discordClientSecret') ?? '';
    const apiBase = `${this.config.get('app.appUrl') ?? 'http://localhost:4000'}/api/v1`;
    this.redirectUri = `${apiBase}/discord/callback`;
  }

  getAuthorizeUrl(userId: string): string {
    const state = this.jwt.sign({ userId }, { expiresIn: '10m' });
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'identify',
      state,
    });
    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<{ userId: string }> {
    let payload: { userId: string };
    try {
      payload = this.jwt.verify(state) as { userId: string };
    } catch {
      throw new BadRequestException('Invalid OAuth state');
    }

    // Exchange code for access token
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      throw new BadRequestException('Failed to exchange Discord code');
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const accessToken = tokenData.access_token;

    // Fetch Discord user info
    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      throw new BadRequestException('Failed to fetch Discord user');
    }

    const userData = (await userRes.json()) as { id: string };
    const discordId = userData.id;

    // Check if discord ID already linked to another account
    const existing = await this.prisma.user.findFirst({ where: { discordId } });
    if (existing && existing.id.toString() !== payload.userId) {
      throw new BadRequestException('Discord account đã được liên kết với tài khoản khác');
    }

    await this.prisma.user.update({
      where: { id: BigInt(payload.userId) },
      data: { discordId },
    });

    return { userId: payload.userId };
  }

  async unlinkDiscord(userId: bigint): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { discordId: null },
    });
    return { message: 'Đã huỷ kết nối Discord' };
  }
}
