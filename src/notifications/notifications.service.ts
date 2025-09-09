import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Project } from '../entities/project.entity';
import { Vendor } from '../entities/vendor.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT', 587);
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      this.logger.warn(
        'SMTP configuration not found. Email notifications will be mocked.',
      );
    }
  }

  async sendMatchNotification(
    project: Project,
    vendor: Vendor,
    score: number,
  ): Promise<void> {
    const enableNotifications =
      this.configService.get('ENABLE_EMAIL_NOTIFICATIONS', 'true') === 'true';

    if (!enableNotifications) {
      this.logger.log(
        `Mock notification: New match for project ${project.id} with vendor ${vendor.name} (score: ${score})`,
      );
      return;
    }

    const subject = `New Vendor Match Found - Project ${project.id}`;
    const html = `
      <h2>New Vendor Match</h2>
      <p>A new vendor match has been found for your project:</p>
      <ul>
        <li><strong>Project:</strong> ${project.country} expansion</li>
        <li><strong>Vendor:</strong> ${vendor.name}</li>
        <li><strong>Match Score:</strong> ${score}</li>
        <li><strong>Vendor Rating:</strong> ${vendor.rating}/5</li>
        <li><strong>Response SLA:</strong> ${vendor.response_sla_hours} hours</li>
      </ul>
      <p>Services offered: ${vendor.services_offered.join(', ')}</p>
      <p>Countries supported: ${vendor.countries_supported.join(', ')}</p>
    `;

    try {
      if (this.transporter && project.client?.contact_email) {
        await this.transporter.sendMail({
          from: this.configService.get(
            'FROM_EMAIL',
            'noreply@expanders360.com',
          ),
          to: project.client.contact_email,
          subject,
          html,
        });
        this.logger.log(
          `Match notification sent to ${project.client.contact_email}`,
        );
      } else {
        this.logger.log(
          `Mock email sent: ${subject} to ${project.client?.contact_email || 'unknown'}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send match notification: ${error.message}`);
    }
  }

  async sendSlaViolationAlert(vendor: Vendor): Promise<void> {
    const subject = `SLA Violation Alert - Vendor ${vendor.name}`;
    const html = `
      <h2>SLA Violation Alert</h2>
      <p>Vendor <strong>${vendor.name}</strong> has exceeded their SLA response time.</p>
      <ul>
        <li><strong>Vendor:</strong> ${vendor.name}</li>
        <li><strong>SLA Hours:</strong> ${vendor.response_sla_hours}</li>
        <li><strong>Rating:</strong> ${vendor.rating}/5</li>
      </ul>
      <p>Please review and take appropriate action.</p>
    `;

    try {
      const adminEmail = this.configService.get(
        'ADMIN_EMAIL',
        'admin@expanders360.com',
      );

      if (this.transporter) {
        await this.transporter.sendMail({
          from: this.configService.get(
            'FROM_EMAIL',
            'noreply@expanders360.com',
          ),
          to: adminEmail,
          subject,
          html,
        });
        this.logger.log(`SLA violation alert sent for vendor ${vendor.name}`);
      } else {
        this.logger.log(`Mock SLA alert: ${subject} for vendor ${vendor.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send SLA violation alert: ${error.message}`);
    }
  }

  async sendDailyMatchSummary(matchCount: number): Promise<void> {
    const subject = `Daily Match Summary - ${matchCount} matches processed`;
    const html = `
      <h2>Daily Match Summary</h2>
      <p>Today's matching process has completed:</p>
      <ul>
        <li><strong>Total matches processed:</strong> ${matchCount}</li>
        <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
    `;

    try {
      const adminEmail = this.configService.get(
        'ADMIN_EMAIL',
        'admin@expanders360.com',
      );

      if (this.transporter) {
        await this.transporter.sendMail({
          from: this.configService.get(
            'FROM_EMAIL',
            'noreply@expanders360.com',
          ),
          to: adminEmail,
          subject,
          html,
        });
        this.logger.log(`Daily match summary sent: ${matchCount} matches`);
      } else {
        this.logger.log(`Mock daily summary: ${matchCount} matches processed`);
      }
    } catch (error) {
      this.logger.error(`Failed to send daily match summary: ${error.message}`);
    }
  }
}
