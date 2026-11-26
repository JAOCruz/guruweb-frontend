import { useCallback, useEffect, useState } from "react";

// PIN de ganancias: un bloqueo en pantalla de las tarjetas con montos del dashboard del admin.
// Desbloqueado dura mientras se use: se bloquea tras 1 hora sin actividad con la página abierta,
// o si la página estuvo cerrada más de 10 minutos. Se guarda la última actividad por usuario.
export const IDLE_LOCK_MS = 60 * 60_000;
export const CLOSED_LOCK_MS = 10 * 60_000;

const key = (userId: number | string) => `guru.earningsUnlock.${userId}`;

export function isExpired(lastActive: number, now: number, page: "open" | "reopened"): boolean {
  return now - lastActive > (page === "open" ? IDLE_LOCK_MS : CLOSED_LOCK_MS);
}

export function readUnlock(userId: number | string): number | null {
  try {
    const n = Number(localStorage.getItem(key(userId)));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function saveUnlock(userId: number | string, lastActive: number) {
  try {
    localStorage.setItem(key(userId), String(lastActive));
  } catch {
    /* without storage the unlock lasts only while this page stays open */
  }
}

export function clearUnlock(userId: number | string) {
  try {
    localStorage.removeItem(key(userId));
  } catch {
    /* nothing to clear */
  }
}

const ACTIVITY = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
const STAMP_EVERY_MS = 30_000;

// enabled = the user has a PIN. Without one the earnings are never locked (as before the PIN).
export function useEarningsLock(userId: number | string | undefined, enabled: boolean) {
  const [unlocked, setUnlocked] = useState(() => {
    if (!enabled || userId == null) return false;
    const last = readUnlock(userId);
    return last != null && !isExpired(last, Date.now(), "reopened");
  });

  // The user (and whether they have a PIN) may arrive after the first render
  useEffect(() => {
    if (!enabled || userId == null) return setUnlocked(false);
    const last = readUnlock(userId);
    setUnlocked(last != null && !isExpired(last, Date.now(), "reopened"));
  }, [enabled, userId]);

  const lock = useCallback(() => {
    if (userId != null) clearUnlock(userId);
    setUnlocked(false);
  }, [userId]);

  const unlock = useCallback(() => {
    if (userId != null) saveUnlock(userId, Date.now());
    setUnlocked(true);
  }, [userId]);

  useEffect(() => {
    if (!enabled || !unlocked || userId == null) return;
    let lastStamp = 0;
    const stamp = () => {
      const now = Date.now();
      if (now - lastStamp < STAMP_EVERY_MS) return;
      lastStamp = now;
      saveUnlock(userId, now);
    };
    const stampNow = () => saveUnlock(userId, Date.now()); // closing: the 10 minutes start now
    const check = () => {
      const last = readUnlock(userId);
      if (last == null || isExpired(last, Date.now(), "open")) lock();
    };
    // Locked in another tab → lock here too
    const onStorage = (e: StorageEvent) => {
      if (e.key === key(userId) && e.newValue == null) setUnlocked(false);
    };
    ACTIVITY.forEach((ev) => window.addEventListener(ev, stamp, { passive: true }));
    window.addEventListener("pagehide", stampNow);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", check);
    const timer = window.setInterval(check, STAMP_EVERY_MS);
    return () => {
      ACTIVITY.forEach((ev) => window.removeEventListener(ev, stamp));
      window.removeEventListener("pagehide", stampNow);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", check);
      window.clearInterval(timer);
    };
  }, [enabled, unlocked, userId, lock]);

  return { locked: enabled && !unlocked, unlock, lock };
}
