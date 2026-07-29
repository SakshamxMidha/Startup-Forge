import 'dotenv/config';
import prisma from '../lib/prisma';
import { embedText } from '../services/embeddings';

const curatedAdvice: string[] = [
  'Pricing a subscription product too low early on makes it hard to raise prices later without churn; it is generally easier to start slightly higher and offer discounts than to raise prices after launch.',
  'Customer acquisition cost (CAC) should be evaluated against customer lifetime value (LTV); a common rule of thumb is aiming for an LTV:CAC ratio of at least 3:1 for a sustainable business.',
  'Early-stage startups should validate demand with a minimum viable product before investing heavily in scaling operations or infrastructure.',
  'Founders often underestimate how long enterprise sales cycles take; B2B deals can take 3-9 months from first contact to signed contract.',
  'A tight, well-defined target audience early on typically outperforms trying to serve everyone; niching down makes marketing and product decisions clearer.',
  'Churn is often a bigger threat to subscription businesses than acquisition; retaining existing customers is usually cheaper than acquiring new ones.',
  'Investors typically want to see a clear use of funds breakdown in a pitch, not just a total ask amount.',
  'Direct-to-consumer brands competing against established players often win through superior niche focus, community, or supply chain advantages rather than price alone.',
  'A seed round typically ranges from $500K to $2M for most consumer startups, though this varies significantly by sector and geography.',
  'Founders should track a small number of key metrics (e.g. MRR, churn rate, CAC) rather than dozens of vanity metrics that do not inform decisions.',
  'Building in public or gathering a waitlist before launch can validate demand and create early momentum without large marketing spend.',
  'Physical product businesses (like subscription boxes) face higher logistics complexity than digital products — shipping costs, damage, and returns should be modeled explicitly.',
  'Competitive differentiation is strongest when it is hard to copy — exclusive partnerships, proprietary data, or community trust are more durable moats than price or feature lists.',
  'Founders often overestimate willingness to pay; testing actual pricing with real customers (not surveys) gives more reliable signal.',
  'A clear one-sentence value proposition that a stranger can understand in 10 seconds is a strong sign the core idea is sound.',
  'Gross margin matters more than revenue growth alone; a fast-growing business with poor unit economics can still fail.',
  'Regulatory and compliance requirements (e.g. food safety, data privacy) should be researched early, since they can significantly affect timelines and costs.',
  'Founder-market fit — genuine expertise or insight into the specific problem — is often as important to investors as the idea itself.',
  'Early customer interviews should focus on past behavior and actual pain, not hypothetical future interest, since people are unreliable predictors of their own future actions.',
  'A common mistake is scaling marketing spend before retention is proven; growth without retention just means paying to churn customers faster.',
];

async function seed() {
  console.log(`Seeding ${curatedAdvice.length} knowledge base entries...`);

  for (const [index, advice] of curatedAdvice.entries()) {
    const embedding = await embedText(advice);
    const vectorLiteral = `[${embedding.join(',')}]`;

    await prisma.$executeRaw`
      INSERT INTO knowledge_chunks (startup_id, source, content, embedding)
      VALUES (NULL, 'curated_advice', ${advice}, ${vectorLiteral}::vector)
    `;

    console.log(`  [${index + 1}/${curatedAdvice.length}] embedded and stored`);
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});