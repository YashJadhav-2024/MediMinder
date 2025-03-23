export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof Notification === "undefined") {
    console.warn("Notifications are not supported in this environment.");
    return false;
  }

  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  return permission === "granted";
};

// Create a notification sound (Check WebView support)
const createNotificationSound = () => {
  try {
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
    audio.load();
    return audio;
  } catch (error) {
    console.error("Notification sound error:", error);
    return null;
  }
};

const notificationSound = createNotificationSound();

export const scheduleNotification = (
  title: string,
  options: NotificationOptions,
  timeInMs: number
): number => {
  return window.setTimeout(() => {
    showNotification(title, options);
  }, timeInMs);
};

export const showNotification = (
  title: string,
  options: NotificationOptions = {}
): void => {
  if (typeof Notification === "undefined") {
    console.warn("Notifications not supported in WebView. Using alert instead.");
    alert(`${title}: ${options.body || ""}`); // Fallback for WebView
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  const defaultOptions: NotificationOptions = {
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    ...options,
  };

  try {
    const notification = new Notification(title, defaultOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };

    playNotificationSound();
  } catch (error) {
    console.error("Error showing notification:", error);
  }
};

export const playNotificationSound = () => {
  if (!notificationSound) {
    console.warn("Notification sound not available.");
    return;
  }

  try {
    notificationSound.currentTime = 0;
    notificationSound.play().catch((err) => console.error("Error playing notification sound:", err));
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};

export const cancelScheduledNotification = (timeoutId: number): void => {
  window.clearTimeout(timeoutId);
};
