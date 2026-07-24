import { z } from 'zod';
import { generateJSON } from './llm';

const FieldSchema = z.object({
  name: z.string(),
  type: z.enum(['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json']),
});

const EntitySchema = z.object({
  name: z.string(),
  fields: z.array(FieldSchema).min(2).max(10),
});

const RelationSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
});

const SchemaDesignSchema = z.object({
  entities: z.array(EntitySchema).min(2).max(10),
  relations: z.array(RelationSchema).min(1).max(15),
});

export type SchemaDesignResult = z.infer<typeof SchemaDesignSchema>;

export async function generateSchemaDesign(rawIdea: string): Promise<SchemaDesignResult> {
  const prompt = `You are a database architect designing a schema for a new application.

Application idea: "${rawIdea}"

Design a reasonable database schema:
- entities: 2-10 core entities (tables) this app would need. Each entity has a name and 2-10 fields (excluding "id", which every entity has automatically — don't include it).
- Each field has a name and a type: one of "String", "Int", "Float", "Boolean", "DateTime", "Json"
- relations: how entities connect to each other. Each relation has "from" (entity name), "to" (entity name), and "type": "one-to-one", "one-to-many", or "many-to-many"

Example output (for a simple blog platform):
{
  "entities": [
    { "name": "User", "fields": [{ "name": "email", "type": "String" }, { "name": "displayName", "type": "String" }] },
    { "name": "Post", "fields": [{ "name": "title", "type": "String" }, { "name": "body", "type": "String" }, { "name": "publishedAt", "type": "DateTime" }] },
    { "name": "Comment", "fields": [{ "name": "text", "type": "String" }, { "name": "createdAt", "type": "DateTime" }] }
  ],
  "relations": [
    { "from": "User", "to": "Post", "type": "one-to-many" },
    { "from": "Post", "to": "Comment", "type": "one-to-many" },
    { "from": "User", "to": "Comment", "type": "one-to-many" }
  ]
}

Return your schema design for the actual idea given above, in the same JSON shape.`;

  const rawResult = await generateJSON<unknown>(prompt);
  return SchemaDesignSchema.parse(rawResult);
}