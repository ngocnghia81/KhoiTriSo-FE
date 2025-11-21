/**
 * Đổi tên file với timestamp và userId để tránh trùng tên
 * @param file - File gốc
 * @param userId - User ID (có thể là string hoặc number)
 * @returns File mới với tên đã đổi
 */
export function renameFileWithTimestamp(file: File, userId: string | number | undefined): File {
  const timestamp = Date.now();
  const userIdStr = userId ? String(userId) : 'unknown';
  const fileExtension = file.name.split('.').pop() || 'bin';
  const newFileName = `${timestamp}_${userIdStr}.${fileExtension}`;
  
  return new File([file], newFileName, { type: file.type });
}

