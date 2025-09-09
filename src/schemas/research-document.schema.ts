import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResearchDocumentDocument = ResearchDocument & Document;

@Schema({ timestamps: true })
export class ResearchDocument {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  projectId: number;

  @Prop({ default: Date.now })
  uploadedAt: Date;

  @Prop()
  fileUrl?: string;

  @Prop()
  fileType?: string;

  @Prop()
  fileSize?: number;
}

export const ResearchDocumentSchema =
  SchemaFactory.createForClass(ResearchDocument);
