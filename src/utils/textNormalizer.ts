/**
 * Utility functions để normalize text cho việc so sánh đáp án
 * Đảm bảo BE và FE dùng cùng logic
 */

/**
 * Strip HTML tags, decode entities, normalize whitespace
 * Giống với TextNormalizer.StripHtmlAndNormalize trong BE
 */
export function stripHtmlAndNormalize(text: string | null | undefined): string {
  if (!text || !text.trim()) {
    return '';
  }

  // Tạo một div tạm để decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;
  let decoded = tempDiv.textContent || tempDiv.innerText || '';

  // Remove HTML tags
  decoded = decoded.replace(/<[^>]+>/g, '');

  // Remove MathML tags nếu có
  decoded = decoded.replace(/<math[^>]*>.*?<\/math>/gis, '');

  // Normalize whitespace (multiple spaces/tabs/newlines -> single space)
  decoded = decoded.replace(/\s+/g, ' ');

  // Trim
  return decoded.trim();
}

/**
 * So sánh 2 text sau khi normalize (case-insensitive)
 */
export function compareNormalized(
  text1: string | null | undefined,
  text2: string | null | undefined
): boolean {
  const normalized1 = stripHtmlAndNormalize(text1);
  const normalized2 = stripHtmlAndNormalize(text2);
  return normalized1.toLowerCase() === normalized2.toLowerCase();
}

/**
 * Kiểm tra xem userAnswer có match với bất kỳ correctAnswer nào không
 * Hỗ trợ exact match và regex match
 */
export function isAnswerCorrect(
  userAnswer: string | null | undefined,
  correctAnswers: string[]
): boolean {
  if (!userAnswer || !userAnswer.trim()) {
    return false;
  }

  const normalizedUser = stripHtmlAndNormalize(userAnswer);

  for (const correctAnswer of correctAnswers) {
    const normalizedCorrect = stripHtmlAndNormalize(correctAnswer);

    // Exact match (case-insensitive)
    if (normalizedCorrect.toLowerCase() === normalizedUser.toLowerCase()) {
      return true;
    }

    // Thử regex match nếu không match exact
    try {
      const regex = new RegExp(normalizedCorrect, 'i');
      if (regex.test(normalizedUser)) {
        return true;
      }
    } catch {
      // Nếu không phải regex hợp lệ, bỏ qua
    }
  }

  return false;
}

