import fs from 'node:fs/promises';
import path from 'node:path';

const apiKey = process.env.TOURAPI_SERVICE_KEY?.trim();
if (!apiKey) throw new Error('Set the TOURAPI_SERVICE_KEY environment variable before running this script.');

const endpoint = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2';
const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
}).formatToParts(new Date());
const part = (type) => parts.find((value) => value.type === type)?.value;
const today = new Date(Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day'))));
const todayYmd = formatDate(today);
const queryStart = new Date(today);
queryStart.setUTCDate(queryStart.getUTCDate() - 30);
const eventStartDate = formatDate(queryStart);
const pageSize = 100;
const maxPages = 10;
const results = [];
let totalCount = 0;

for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
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

  const response = await fetch(url);
  if (!response.ok) throw new Error(`TourAPI returned HTTP ${response.status} on page ${pageNo}.`);
  const payload = await response.json();
  const header = payload?.response?.header;
  if (header && header.resultCode !== '0000') {
    throw new Error(`TourAPI error ${header.resultCode}: ${header.resultMsg || 'unknown error'}`);
  }
  const body = payload?.response?.body;
  totalCount = Number(body?.totalCount || 0);
  const rows = body?.items?.item;
  const items = Array.isArray(rows) ? rows : rows ? [rows] : [];
  results.push(...items);
  if (!items.length || results.length >= totalCount || pageNo * pageSize >= totalCount) break;
}

const items = results
  .filter((item) => !item.eventenddate || String(item.eventenddate) >= todayYmd)
  .filter((item) => item.contentid && item.title)
  .map((item) => ({ ...item, contentid: String(item.contentid) }));

if (!items.length) {
  throw new Error(`TourAPI returned no current or upcoming festivals for start date ${eventStartDate}. Previous published data was left untouched.`);
}

const output = {
  schemaVersion: 1,
  source: '한국관광공사 TourAPI searchFestival2',
  generatedAt: new Date().toISOString(),
  query: { eventStartDate, maxPages, pageSize },
  totalCountFromApi: totalCount,
  count: items.length,
  truncated: totalCount > maxPages * pageSize,
  items,
};

const outputPath = path.join(process.cwd(), 'assets', 'festivals.json');
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Saved ${items.length} current/upcoming TourAPI festivals to ${outputPath}.`);

function formatDate(date) {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;
}
