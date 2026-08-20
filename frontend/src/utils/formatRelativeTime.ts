// 알림 목록처럼 "방금 / 5분 전 / 어제"같은 짧은 상대 시간 표기가 필요한 화면에서 쓴다.
// toLocaleString()의 긴 절대 시각(예: "2026. 8. 20. 오전 5:21:16")은 목록에서 줄바꿈까지
// 유발해 화면이 답답해 보였음.
export function formatRelativeTime(dateInput: string | number | Date): string {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;

  return date.toLocaleDateString();
}
