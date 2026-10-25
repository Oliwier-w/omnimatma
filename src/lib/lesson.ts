/** Serializable contract: safe to import from client components. */
export type Lesson = {
  id: string;
  title: string;
  level: string;
  category: string;
  generatorId: string;
  prerequisites: string[];
  minutes: number;
  description: string;
  modes: { eli5: string; school: string; visual: string; academic: string };
  example: string;
  pitfalls: string;
  formula: string;
  content: string;
};
