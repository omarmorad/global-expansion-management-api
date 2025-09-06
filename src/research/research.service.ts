import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResearchDocument, ResearchDocumentDocument } from '../schemas/research-document.schema';
import { CreateResearchDocumentDto } from './dto/create-research-document.dto';
import { SearchResearchDocumentDto } from './dto/search-research-document.dto';

@Injectable()
export class ResearchService {
  constructor(
    @InjectModel(ResearchDocument.name)
    private researchDocumentModel: Model<ResearchDocumentDocument>,
  ) {}

  async create(createResearchDocumentDto: CreateResearchDocumentDto): Promise<ResearchDocument> {
    const document = new this.researchDocumentModel({
      ...createResearchDocumentDto,
      tags: createResearchDocumentDto.tags || [],
      uploadedAt: new Date(),
    });

    return document.save();
  }

  async findAll(): Promise<ResearchDocument[]> {
    return this.researchDocumentModel
      .find()
      .sort({ uploadedAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ResearchDocument | null> {
    return this.researchDocumentModel.findById(id).exec();
  }

  async search(searchDto: SearchResearchDocumentDto): Promise<ResearchDocument[]> {
    const query: any = {};

    if (searchDto.projectId) {
      query.projectId = searchDto.projectId;
    }

    if (searchDto.tags && searchDto.tags.length > 0) {
      query.tags = { $in: searchDto.tags };
    }

    if (searchDto.text) {
      query.$or = [
        { title: { $regex: searchDto.text, $options: 'i' } },
        { content: { $regex: searchDto.text, $options: 'i' } },
      ];
    }

    return this.researchDocumentModel
      .find(query)
      .limit(searchDto.limit || 50)
      .skip(searchDto.skip || 0)
      .sort({ uploadedAt: -1 })
      .exec();
  }

  async findByProject(projectId: number): Promise<ResearchDocument[]> {
    return this.researchDocumentModel
      .find({ projectId })
      .sort({ uploadedAt: -1 })
      .exec();
  }

  async countByProject(projectId: number): Promise<number> {
    return this.researchDocumentModel.countDocuments({ projectId }).exec();
  }

  async countByCountry(country: string): Promise<number> {
    // This would require joining with project data
    // For now, we'll use tags to identify country-related documents
    return this.researchDocumentModel
      .countDocuments({
        tags: { $in: [country.toLowerCase(), country] }
      })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.researchDocumentModel.findByIdAndDelete(id).exec();
  }

  async update(id: string, updateData: Partial<CreateResearchDocumentDto>): Promise<ResearchDocument | null> {
    return this.researchDocumentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }
}