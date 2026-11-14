const FAR_KM = 25;

export function buildAdvisory(user, waqi) {
  if (!user) {
    return {
      tone: "info",
      title: "No health profile yet",
      messages: ["Create a profile to compare the air quality with your own alert threshold."],
    };
  }

  const aqi = waqi?.aqi;
  if (typeof aqi !== "number") {
    return {
      tone: "info",
      title: "No AQI to compare",
      messages: ["No overall AQI value is available for this location right now."],
    };
  }

  const threshold = user.alertPreferences?.aqiThreshold ?? 100;
  const alertsOn = user.alertPreferences?.enabled !== false;
  const messages = [];
  let tone = "ok";

  if (aqi > threshold) {
    tone = "warn";
    messages.push(
      alertsOn
        ? `The AQI is ${aqi}, above your alert threshold of ${threshold}.`
        : `The AQI is ${aqi}, above your threshold of ${threshold}. Your alerts are turned off.`
    );
  } else {
    messages.push(`The AQI is ${aqi}, within your threshold of ${threshold}.`);
  }

  const groups = [];
  if (user.healthProfile?.asthma) groups.push("asthma");
  if (user.healthProfile?.elderly) groups.push("elderly");
  if (user.healthProfile?.children) groups.push("children");

  if (groups.length > 0 && aqi > 100) {
    tone = "warn";
    messages.push(
      `On the standard AQI scale, values above 100 are considered unhealthy for sensitive groups. You listed: ${groups.join(", ")}. Consider limiting time outdoors.`
    );
  }

  const distance = waqi?.station?.distanceKm;
  if (typeof distance === "number" && distance > FAR_KM) {
    messages.push(
      `The nearest station is ${distance} km away, so this may not reflect the air where you are.`
    );
  }

  messages.push("This is general information, not medical advice.");

  return {
    tone,
    title: tone === "warn" ? "Air quality advisory" : "Air quality is within your threshold",
    messages,
  };
}