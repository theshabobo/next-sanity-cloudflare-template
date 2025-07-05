import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: 'xxxxxx',
  dataset: 'production',
  apiVersion: '2023-06-01',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
});
export async function sanityFetch({ query, params = {} }) {
  return await client.fetch(query, params);
}