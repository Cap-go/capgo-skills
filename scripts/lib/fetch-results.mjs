/**
 * Shared result helpers for raw GitHub reads and cached API diffs.
 */

/** @returns {'ok'|'missing'|'retry'|'fail'} */
export function classifyRawHttpStatus(status, canRetry) {
  const code = Number(status);
  if (code >= 200 && code < 300) return 'ok';
  if (code === 404) return 'missing';
  if (canRetry && (code === 403 || code === 429 || code >= 500)) return 'retry';
  return 'fail';
}

/**
 * Decide whether changelog candidate reads produced a comparable pair,
 * no changelog, or only failures.
 * @param {{ name: string, oldStatus: string, newStatus: string, oldError?: string, newError?: string }[]} candidates
 */
export function changelogReadOutcome(candidates) {
  const errors = [];
  for (const candidate of candidates) {
    if (candidate.oldStatus === 'error' || candidate.newStatus === 'error') {
      const parts = [];
      if (candidate.oldStatus === 'error') parts.push(candidate.oldError || 'old read failed');
      if (candidate.newStatus === 'error') parts.push(candidate.newError || 'new read failed');
      errors.push(`${candidate.name}: ${parts.join('; ')}`);
      continue;
    }
    if (candidate.oldStatus === 'missing' && candidate.newStatus === 'missing') continue;
    return { status: 'compared' };
  }
  if (errors.length) {
    return { status: 'failed', error: `changelog reads failed: ${errors.join('; ')}` };
  }
  return { status: 'none' };
}

/**
 * Return file text from a raw read. Null means the file is missing;
 * status 'error' must not be treated as absent.
 */
export function textFromRawRead(result, label = 'file') {
  if (!result || result.status === 'missing') return null;
  if (result.status === 'ok') return result.text ?? null;
  throw new Error(result.error || `${label} read failed`);
}

/**
 * Prefer a package-keyed diff. Repo-level fallback cannot attribute a
 * root-package record to another package, and legacy records without a
 * package name are only valid for root-package lookups.
 */
export function findCachedDiff(diffs, pkgName, repo, pkgPath = '') {
  const list = Array.isArray(diffs) ? diffs : [];
  if (pkgName) {
    const byPackage = list.find((diff) => diff.package === pkgName);
    if (byPackage) return byPackage;
  }
  if (!repo) return null;
  return (
    list.find((diff) => {
      if (diff.repo !== repo || diff.pkgPath) return false;
      if (diff.package) return diff.package === pkgName;
      return !pkgPath;
    }) || null
  );
}
