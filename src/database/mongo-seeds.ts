import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';
import { ResearchDocument, ResearchDocumentSchema } from '../schemas/research-document.schema';

// Load environment variables
const envPath = process.cwd() + '/.env';
dotenv.config({ path: envPath });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/global_expansion_docs';

async function seedMongoDB() {
  try {
    console.log('Connecting to MongoDB at:', mongoUri);
    await connect(mongoUri);
    console.log('Connected to MongoDB');
    console.log(`Connected to database: ${connection.name}`);

    const ResearchDocumentModel = connection.model('ResearchDocument', ResearchDocumentSchema);
    console.log(`Using collection: ${ResearchDocumentModel.collection.name}`);

    // Clear existing documents
    console.log('Clearing existing documents...');
    await ResearchDocumentModel.deleteMany({});
    console.log('Existing documents cleared');

    // Sample research documents
    const documents = [
      {
        title: 'German Market Analysis 2024',
        content: 'Comprehensive analysis of the German market including regulatory requirements, tax implications, and business culture. Key findings include strong demand for tech services and favorable business environment for international companies.',
        tags: ['germany', 'market-analysis', 'regulatory', 'tech'],
        projectId: 1,
        fileType: 'pdf',
        fileSize: 2048000,
      },
      {
        title: 'Japan Expansion Legal Requirements',
        content: 'Detailed overview of legal requirements for establishing business operations in Japan. Covers corporate structure options, employment law, and compliance requirements.',
        tags: ['japan', 'legal', 'compliance', 'employment'],
        projectId: 2,
        fileType: 'docx',
        fileSize: 1024000,
      },
      {
        title: 'US Market Entry Strategy',
        content: 'Strategic recommendations for entering the US market including state selection, tax considerations, and marketing approaches. Focus on technology sector opportunities.',
        tags: ['usa', 'strategy', 'marketing', 'technology'],
        projectId: 3,
        fileType: 'pdf',
        fileSize: 3072000,
      },
      {
        title: 'Nordic Region Business Culture Guide',
        content: 'Cultural insights and business practices across Nordic countries. Essential reading for companies planning expansion to Sweden, Norway, Denmark, or Finland.',
        tags: ['sweden', 'norway', 'denmark', 'finland', 'culture', 'business-practices'],
        projectId: 4,
        fileType: 'pdf',
        fileSize: 1536000,
      },
      {
        title: 'European GDPR Compliance Checklist',
        content: 'Comprehensive checklist for GDPR compliance when operating in European markets. Includes data protection requirements and privacy policy templates.',
        tags: ['europe', 'gdpr', 'compliance', 'data-protection'],
        projectId: 1,
        fileType: 'docx',
        fileSize: 512000,
      },
      {
        title: 'Asia-Pacific HR Best Practices',
        content: 'Human resources best practices for companies expanding into Asia-Pacific region. Covers recruitment, compensation, and employee relations.',
        tags: ['asia-pacific', 'hr', 'recruitment', 'compensation'],
        projectId: 2,
        fileType: 'pdf',
        fileSize: 2560000,
      },
    ];

    console.log('Inserting documents...');
    const savedDocuments = await ResearchDocumentModel.insertMany(documents);
    console.log(`Seeded ${savedDocuments.length} research documents`);

    // Verify insertion
    const count = await ResearchDocumentModel.countDocuments();
    console.log(`Verified ${count} documents in database`);

    await connection.close();
    console.log('MongoDB connection closed');

  } catch (error) {
    console.error('Error seeding MongoDB:', error);
    process.exit(1);
  }
}

seedMongoDB();
