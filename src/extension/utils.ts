export const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function getDomElement(id: string): HTMLElement {
  return document.getElementById(id)!;
};

export function getHostName(url: string): string {
  return new URL(url).hostname;
};
