import { getCollection } from 'astro:content';

/** Jobs, most recent first (by the start of each job's latest role). */
export async function getJobs() {
  const jobs = await getCollection('experience');
  return jobs.sort((a, b) => latestStart(b) - latestStart(a));
}

const latestStart = (job: Awaited<ReturnType<typeof getJobs>>[number]) =>
  Math.max(...job.data.roles.map((r) => r.start.valueOf()));

const month = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "Feb 2026 – Present" */
export const formatRange = (start: Date, end?: Date) => `${month(start)} – ${end ? month(end) : 'Present'}`;
