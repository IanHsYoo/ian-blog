import { Client } from '@notionhq/client'

let _notion: Client | null = null

export function getNotionClient(): Client {
  if (!process.env.NOTION_API_KEY) {
    throw new Error(
      'Missing NOTION_API_KEY. Add it to .env.local (see .env.example).'
    )
  }
  if (!_notion) {
    _notion = new Client({ auth: process.env.NOTION_API_KEY })
  }
  return _notion
}

export function getDatabaseId(): string {
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error(
      'Missing NOTION_DATABASE_ID. Add it to .env.local (see .env.example).'
    )
  }
  return process.env.NOTION_DATABASE_ID
}

export const isNotionConfigured =
  Boolean(process.env.NOTION_API_KEY) &&
  Boolean(process.env.NOTION_DATABASE_ID)
