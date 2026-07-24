import { SchemaDesignResult } from './generateSchemaDesign';

const relationSymbols: Record<string, string> = {
  'one-to-one': '||--||',
  'one-to-many': '||--o{',
  'many-to-many': '}o--o{',
};

export function schemaToMermaid(schema: SchemaDesignResult): string {
  const lines: string[] = ['erDiagram'];

  for (const entity of schema.entities) {
    lines.push(`    ${entity.name} {`);
    for (const field of entity.fields) {
      lines.push(`        ${field.type} ${field.name}`);
    }
    lines.push('    }');
  }

  for (const relation of schema.relations) {
    const symbol = relationSymbols[relation.type];
    lines.push(`    ${relation.from} ${symbol} ${relation.to} : "relates to"`);
  }

  return lines.join('\n');
}