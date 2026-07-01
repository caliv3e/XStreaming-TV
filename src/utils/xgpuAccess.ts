import XcloudApi from '../xCloud';

const ACCESS_CACHE_TTL = 5 * 60 * 1000;
const TITLE_LOOKUP_TIMEOUT = 3500;
const PROBE_TIMEOUT = 6500;
const MAX_PROBE_ATTEMPTS = 1;
const PROBE_TITLE_IDS = [
  'FORZAHORIZON5',
  'HALOINFINITE',
  'MINECRAFTDUNGEONS',
  'GEARS5',
  'STARFIELD',
];
const FREE_TO_PLAY_TITLE_IDS = ['FORTNITE'];

let accessCache = {
  key: '',
  checkedAt: 0,
  hasAccess: false,
};

const getCloudAccessKey = (streamingTokens: any) => {
  const xCloudToken = streamingTokens?.xCloudToken;
  const region = xCloudToken?.getDefaultRegion?.();
  const gsToken = xCloudToken?.data?.gsToken;

  if (!region?.baseUri || !gsToken) {
    return null;
  }

  return {
    key: `${region.baseUri}:${gsToken}`,
    baseUri: region.baseUri,
    gsToken,
  };
};

const normalizeTitleId = (titleId: any) =>
  typeof titleId === 'string' ? titleId.trim().toUpperCase() : '';

const getTitleId = (title: any) =>
  normalizeTitleId(
    title?.titleId ||
      title?.XCloudTitleId ||
      title?.details?.titleId ||
      title?.details?.xCloudTitleId,
  );

const collectProbeTitleIds = (titles: any[]) => {
  const availableTitleIds = titles.map(getTitleId).filter(Boolean);
  const availableSet = new Set(availableTitleIds);
  const preferredTitleIds =
    availableSet.size > 0
      ? PROBE_TITLE_IDS.filter(titleId => availableSet.has(titleId))
      : PROBE_TITLE_IDS;
  const fallbackTitleIds = availableTitleIds.filter(
    titleId =>
      !FREE_TO_PLAY_TITLE_IDS.includes(titleId) &&
      !preferredTitleIds.includes(titleId),
  );

  return [...preferredTitleIds, ...fallbackTitleIds].filter(
    (titleId, index, allTitleIds) => allTitleIds.indexOf(titleId) === index,
  );
};

const withTimeout = <T>(promise: Promise<T>, fallback: T, timeoutMs: number) =>
  new Promise<T>(resolve => {
    const timer = setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);

    promise
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });

export const checkXgpuCloudAccess = async (
  streamingTokens: any,
  force = false,
) => {
  const tokenParts = getCloudAccessKey(streamingTokens);

  if (!tokenParts) {
    return false;
  }

  const now = Date.now();
  if (
    !force &&
    accessCache.key === tokenParts.key &&
    now - accessCache.checkedAt < ACCESS_CACHE_TTL
  ) {
    return accessCache.hasAccess;
  }

  const xCloudApi = new XcloudApi(
    tokenParts.baseUri,
    tokenParts.gsToken,
    'cloud',
  );
  const titles: any = await withTimeout(
    xCloudApi.getTitles(),
    {results: []},
    TITLE_LOOKUP_TIMEOUT,
  );
  const titleResults = Array.isArray(titles?.results)
    ? titles.results
    : Array.isArray(titles)
    ? titles
    : [];
  const probeTitleIds = collectProbeTitleIds(titleResults).slice(
    0,
    MAX_PROBE_ATTEMPTS,
  );
  let hasAccess = false;

  for (const titleId of probeTitleIds) {
    hasAccess = await withTimeout(
      xCloudApi.probeCloudPlayAccess(titleId, 720),
      false,
      PROBE_TIMEOUT,
    );
    if (hasAccess) {
      break;
    }
  }

  accessCache = {
    key: tokenParts.key,
    checkedAt: now,
    hasAccess,
  };

  return hasAccess;
};
