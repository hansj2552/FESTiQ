import fs from 'node:fs/promises';
import path from 'node:path';

const apiKey = process.env.TOURAPI_SERVICE_KEY?.trim();
if (!apiKey) throw new Error('Set the TOURAPI_SERVICE_KEY environment variable before running this script.');

const endpoint = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2';
const pageSize = 100;
const maxPagesPerDate = 3;
const lookBackDays = 30;
const lookAheadDays = 180;

const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
}).formatToParts(new Date());
const part = (type) => parts.find((value) => value.type === type)?.value;
const today = new Date(Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day'))));
const todayYmd = formatDate(today);
const firstDate = new Date(today);
firstDate.setUTCDate(firstDate.getUTCDate() - lookBackDays);
const lastDate = new Date(today);
lastDate.setUTCDate(lastDate.getUTCDate() + lookAheadDays);

const rowsById = new Map();
const truncatedDates = [];
let totalCountFromApi = 0;
let requests = 0;
let rowsReceived = 0;
let datesWithResults = 0;
let firstResponseSummary;
let firstBodyKeys = [];

for (let date = new Date(firstDate); date <= lastDate; date.setUTCDate(date.getUTCDate() + 1)) {
  const eventStartDate = formatDate(date);
  let dateTotalCount = 0;
  let pagesFetched = 0;

  for (let pageNo = 1; pageNo <= maxPagesPerDate; pageNo += 1) {
    if (requests > 0) await new Promise((resolve) => setTimeout(resolve, 100));
    const url = new URL(endpoint);
    for (const [name, value] of Object.entries({
      serviceKey: apiKey,
      MobileOS: 'ETC',
      MobileApp: 'FESTiQ',
      _type: 'json',
      eventStartDate,
      pageNo,
      numOfRows: pageSize,
      arrange: 'A',
      listYN: 'Y',
    })) url.searchParams.set(name, String(value));

    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    requests += 1;
    if (!response.ok) throw new Error(`TourAPI returned HTTP ${response.status} for eventStartDate ${eventStartDate}, page ${pageNo}.`);

    const payload = await response.json();
    const header = payload?.response?.header;
    if (header && header.resultCode !== '0000') {
      throw new Error(`TourAPI error ${header.resultCode} for eventStartDate ${eventStartDate}: ${header.resultMsg || 'unknown error'}`);
    }

    const body = payload?.response?.body;
    dateTotalCount = Number(body?.totalCount || 0);
    const rows = body?.items?.item;
    const items = Array.isArray(rows) ? rows : rows ? [rows] : [];
    if (!firstResponseSummary) {
      firstResponseSummary = { resultCode: header?.resultCode ?? null, resultMsg: header?.resultMsg ?? null };
      firstBodyKeys = body && typeof body === 'object' ? Object.keys(body) : [];
    }
    rowsReceived += items.length;
    pagesFetched = pageNo;
    for (const item of items) {
      if (item?.contentid && item?.title) rowsById.set(String(item.contentid), { ...item, contentid: String(item.contentid) });
    }

    if (!items.length || pageNo * pageSize >= dateTotalCount) break;
    // Keep a safety cap well below the portal's published 1,000-request development quota.
    if (pageNo === maxPagesPerDate) truncatedDates.push(eventStartDate);
  }
  totalCountFromApi += dateTotalCount;
  if (dateTotalCount > 0) datesWithResults += 1;
}

const items = [...rowsById.values()]
  .filter((item) => !item.eventenddate || String(item.eventenddate) >= todayYmd)
  .sort((a, b) => String(a.eventstartdate || '').localeCompare(String(b.eventstartdate || '')));

if (!items.length) {
  throw new Error(`TourAPI returned no publishable festivals after ${requests} date-based requests (${formatDate(firstDate)}–${formatDate(lastDate)}). Diagnostics: totalCount=${totalCountFromApi}, rowsReceived=${rowsReceived}, uniqueValidItems=${rowsById.size}, datesWithResults=${datesWithResults}, firstResponse=${JSON.stringify(firstResponseSummary)}, bodyKeys=${firstBodyKeys.join(',')}. Previous published data was left untouched.`);
}

const output = {
  schemaVersion: 1,
  source: '한국관광공사 TourAPI searchFestival2',
  generatedAt: new Date().toISOString(),
  query: {
    eventStartDateFrom: formatDate(firstDate),
    eventStartDateTo: formatDate(lastDate),
    lookBackDays,
    lookAheadDays,
    maxPagesPerDate,
    pageSize,
    requestCount: requests,
  },
  totalCountFromApi,
  count: items.length,
  truncated: truncatedDates.length > 0,
  truncatedDates,
  items,
};

const outputPath = path.join(process.cwd(), 'assets', 'festivals.json');
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Saved ${items.length} current/upcoming TourAPI festivals from ${requests} date-based requests to ${outputPath}.`);
if (truncatedDates.length) console.warn(`Some dates reached the ${maxPagesPerDate}-page cap: ${truncatedDates.join(', ')}`);

function formatDate(value) {
  return `${value.getUTCFullYear()}${String(value.getUTCMonth() + 1).padStart(2, '0')}${String(value.getUTCDate()).padStart(2, '0')}`;
}
