/**
 * Calculates the exponential cdf.
 *
 * @param {number} x The value.
 * @returns {number} The exponential cdf.
 */
function exponential_cdf(x) {
  return 1 - 2 ** -x;
}

/**
 * Calculates the log normal cdf.
 *
 * @param {number} x The value.
 * @returns {number} The log normal cdf.
 */
function log_normal_cdf(x) {
  // approximation
  return x / (1 + x);
}

/**
 * Calculates the users rank.
 *
 * @param {object} params Parameters on which the user's rank depends.
 * @param {boolean} params.all_commits Whether `include_all_commits` was used.
 * @param {number} params.commits Number of commits.
 * @param {number} params.prs The number of pull requests (unused).
 * @param {number} params.issues The number of issues.
 * @param {number} params.reviews The number of reviews (unused).
 * @param {number} params.repos Total number of repos (unused).
 * @param {number} params.stars The number of stars.
 * @param {number} params.followers The number of followers (unused).
 * @returns {{ level: string, percentile: number }} The users rank.
 */
function calculateRank({
  all_commits,
  commits,
  // eslint-disable-next-line no-unused-vars
  prs, // unused in ranking calculation
  issues,
  // eslint-disable-next-line no-unused-vars
  reviews, // unused in ranking calculation
  // eslint-disable-next-line no-unused-vars
  repos, // unused in ranking calculation
  stars,
  // eslint-disable-next-line no-unused-vars
  followers, // unused in ranking calculation
}) {
  const COMMITS_MEDIAN = all_commits ? 1000 : 250,
    COMMITS_WEIGHT = 2;
  const ISSUES_MEDIAN = 25,
    ISSUES_WEIGHT = 1;
  // Stars have the highest weight as they represent community impact and project value
  const STARS_MEDIAN = 50,
    STARS_WEIGHT = 15;

  const TOTAL_WEIGHT = COMMITS_WEIGHT + ISSUES_WEIGHT + STARS_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

  const rank =
    1 -
    (COMMITS_WEIGHT * exponential_cdf(commits / COMMITS_MEDIAN) +
      ISSUES_WEIGHT * exponential_cdf(issues / ISSUES_MEDIAN) +
      STARS_WEIGHT * log_normal_cdf(stars / STARS_MEDIAN)) /
      TOTAL_WEIGHT;

  const level = LEVELS[THRESHOLDS.findIndex((t) => rank * 100 <= t)];

  return { level, percentile: rank * 100 };
}

export { calculateRank };
export default calculateRank;
