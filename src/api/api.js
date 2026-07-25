const API_BASE_URL = "https://quantlab-k9yr.onrender.com";

export async function getTradingPairs() {
  const response = await fetch(`${API_BASE_URL}/trading_pairs`);

  if (!response.ok) {
    throw new Error("Failed to fetch trading pairs");
  }

  return response.json();
}

export async function getStrategies() {
  const response = await fetch(`${API_BASE_URL}/strategies`);

  if (!response.ok) {
    throw new Error("Failed to fetch strategies");
  }

  return response.json();
}

export async function getTimeframes() {
  const response = await fetch(`${API_BASE_URL}/timeframe`);

  if (!response.ok) {
    throw new Error("Failed to fetch timeframes");
  }

  return response.json();
}

export async function analyseStrategy(data) {
  const response = await fetch(`${API_BASE_URL}/analyse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail || "Failed to analyse strategy"
    );
  }

  return response.json();
}
