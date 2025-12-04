/**
 * Ad ve Soyadın baş harflerini alır.
 * Örnek: "Ahmet Yılmaz" -> "AY", "Mehmet" -> "ME"
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name.substring(0, 2).toUpperCase();
};

/**
 * Tarihi okunabilir bir formata çevirir.
 * Örnek: "January 1, 2024"
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Tarihin üzerinden ne kadar zaman geçtiğini gösterir.
 * Örnek: "2m ago", "5h ago", "3d ago"
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const timeAgo = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - timeAgo.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};
