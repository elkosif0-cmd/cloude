/**
 * تنظيف وتطبيع النصوص العربية للبحث والمطابقة
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // إزالة التشكيل (الحركات)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // إزالة التطويل (الكشيدة)
    .replace(/\u0640/g, '')
    // توحيد الألفات: أ إ آ -> ا
    .replace(/[أإآٱ]/g, 'ا')
    // توحيد التاء المربوطة والهاء: ة -> ه
    .replace(/ة/g, 'ه')
    // توحيد الياء والألف المقصورة: ى -> ي
    .replace(/ى/g, 'ي')
    // إزالة المسافات المتعددة
    .replace(/\s+/g, ' ');
}

/**
 * حساب مسافة ليفنشتاين (Levenshtein Distance)
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * حساب درجة التشابه بين كلمتين من 0.0 إلى 1.0
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const n1 = normalizeArabic(str1);
  const n2 = normalizeArabic(str2);

  if (!n1 || !n2) return 0;
  if (n1 === n2) return 1.0;

  // إذا كانت إحداهما تحتوي الأخرى بشكل كامل
  if (n1.includes(n2) || n2.includes(n1)) {
    const minLen = Math.min(n1.length, n2.length);
    const maxLen = Math.max(n1.length, n2.length);
    return 0.8 + (minLen / maxLen) * 0.2;
  }

  // حساب المسافة
  const dist = levenshteinDistance(n1, n2);
  const maxLen = Math.max(n1.length, n2.length);
  return Math.max(0, 1 - dist / maxLen);
}
