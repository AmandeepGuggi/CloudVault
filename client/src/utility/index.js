export function getUniquename(baseName, existingNames) {
  const normalized = baseName.trim();
  if (!existingNames.includes(normalized)) {
    return normalized;
  }

  const regex = new RegExp(`^${normalized} \\((\\d+)\\)$`);
  const usedNumbers = new Set();

  existingNames.forEach(name => {
    const match = name.match(regex);
    if (match) {
      usedNumbers.add(Number(match[1]));
    }
  });

  let i = 1;
  while (usedNumbers.has(i)) {
    i++;
  }

  return `${normalized} (${i})`;
}
export const BASE_URL = "http://localhost:4000"