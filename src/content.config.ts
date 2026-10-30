import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projectCategory = z.enum(["ai", "web", "product", "desktop", "mobile", "open-source"]);
const projectStatus = z.enum(["live", "shipped", "private", "in-progress"]);
const projectLinkIcon = z.enum(["external", "github", "code", "globe", "file"]);

const usageBlock = z.object({
  label: z.string(),
  lang: z.string().default("bash"),
  code: z.string(),
});

const usageExample = z.object({
  title: z.string(),
  description: z.string().optional(),
  lang: z.string().default("ts"),
  code: z.string(),
});

const projectUsage = z.object({
  intro: z.string(),
  installs: z.array(usageBlock).default([]),
  examples: z.array(usageExample).default([]),
  notes: z.array(z.string()).default([]),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    summary: z.string(),
    outcome: z.string().optional(),
    category: projectCategory,
    status: projectStatus,
    year: z.string(),
    role: z.string(),
    client: z.string().optional(),
    timeline: z.string().optional(),
    stack: z.array(z.string()).min(1),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    repo: z.string().url().optional(),
    live: z.string().url().optional(),
    packageUrl: z.string().url().optional(),
    usage: projectUsage.optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().url(),
          icon: projectLinkIcon.default("external"),
        }),
      )
      .default([]),
    featured: z.boolean().default(false),
    private: z.boolean().default(false),
    order: z.number().int().default(99),
    accent: z.string().default("#c8ff5e"),
    highlights: z.array(z.string()).default([]),
    decisions: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
        }),
      )
      .default([]),
    capabilities: z.array(z.string()).default([]),
    metrics: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
