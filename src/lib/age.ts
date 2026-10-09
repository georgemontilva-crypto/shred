/* Shared state for the age check, so other parts of the page can wait for it. */
const KEY = "sm-age-ok";
const EVENT = "sm:age-ok";

export function ageConfirmed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function confirmAge(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* private mode: the check simply shows again next visit */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function onAgeConfirmed(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}
