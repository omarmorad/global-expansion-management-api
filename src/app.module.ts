import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { VendorsModule } from './vendors/vendors.module';
import { ResearchModule } from './research/research.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Client } from './entities/client.entity';
import { Project } from './entities/project.entity';
import { Vendor } from './entities/vendor.entity';
import { Match } from './entities/match.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database:
          process.env.NODE_ENV === 'production'
            ? '/tmp/database.sqlite'
            : configService.get('DATABASE_PATH', './database.sqlite'),
        entities: [Client, Project, Vendor, Match],
        synchronize: process.env.NODE_ENV !== 'production', // Synchronize only in development
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get(
          'MONGODB_URI',
          'mongodb://localhost:27017/global_expansion_docs',
        ),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ProjectsModule,
    VendorsModule,
    ResearchModule,
    AnalyticsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
