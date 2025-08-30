import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class WhatsAppService {
  private readonly WHATSAPP_API_BASE_URL = this.configService.get<string>(
    'WHATSAPP_API_BASE_URL',
  );
  private readonly WHATSAPP_TOKEN =
    this.configService.get<string>('WHATSAPP_TOKEN');
  private readonly AUTH_HEADER = {
    Authorization: `Bearer ${this.WHATSAPP_TOKEN}`,
  };

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  private async sendMessage(payload: Record<string, unknown>): Promise<void> {
    try {
      const response = await fetch(`${this.WHATSAPP_API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { ...this.AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Failed to send WhatsApp message', {
          error: errorData,
          payload,
        });
        throw new Error(
          errorData.error?.message || 'WhatsApp API returned an error',
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message`, {
        error: error.message,
        payload,
      });
      throw new HttpException(
        'Failed to send WhatsApp message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadMedia(buffer: Buffer, filename: string): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], {
      type: 'application/pdf',
    });
    formData.append('file', blob, filename);
    formData.append('messaging_product', 'whatsapp');

    try {
      const response = await fetch(`${this.WHATSAPP_API_BASE_URL}/media`, {
        method: 'POST',
        headers: this.AUTH_HEADER,
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.id) {
        this.logger.error('Failed to upload media to WhatsApp', data.error);
        throw new Error(
          data.error?.message || 'WhatsApp media ID not found in response',
        );
      }
      return data.id;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      this.logger.error('Failed to upload media to WhatsApp', error.stack);
      throw new HttpException(
        'Failed to upload media to WhatsApp',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendDocument(
    to: string,
    mediaId: string,
    filename: string,
  ): Promise<void> {
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'document',
      document: { id: mediaId, filename },
    };
    await this.sendMessage(payload);
  }

  async sendTemplate(to: string, templateName: string): Promise<void> {
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: { name: templateName, language: { code: 'id' } },
    };
    await this.sendMessage(payload);
  }
}
