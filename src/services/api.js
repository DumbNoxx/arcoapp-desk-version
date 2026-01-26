export const fetchRates = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL);
    const response_p2p = await fetch(import.meta.env.VITE_API_URL_P2P);

    if (response.ok) {
      const data = await response.json();

      if (!data || !data.current) {
        throw new Error("Invalid API response structure");
      }
      // data de precios bcv
      const date = data.current.date || new Date().toISOString();

      const bcv_usd_data = data.current.usd || 0;
      const bcv_euro_data = data.current.eur || 0;
      const bcv_usd_data_previous = data.previous?.usd || 0;
      const bcv_euro_data_previous = data.previous?.eur || 0;
      const change_percentage_bcv_usd = data.changePercentage?.usd || 0;
      const change_percentage_bcv_eur = data.changePercentage?.eur || 0;
      let p2p = 0;

      if (response_p2p.ok) {
        const dataP2p = await response_p2p.json();
        // data de precio p2p aprox
        p2p = dataP2p ? dataP2p.rate : 0;
      }
      return {
        bcv_usd: {
          price: bcv_usd_data || 0,
          change: change_percentage_bcv_usd || 0,
          last_update: date,
          previous_price: bcv_usd_data_previous || 0,
        },
        bcv_eur: {
          price: bcv_euro_data || 0,
          change: change_percentage_bcv_eur || 0,
          last_update: date,
          previous_price: bcv_euro_data_previous || 0
        },
        usdt: {
          price: p2p || 0,
          change: 0,
          last_update: 0,
          previous_price: 0
        }
      };
    }
  } catch (e) {
    console.log("API failed, using fallback", e);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bcv_usd: { price: 0.00, change: 0.00, last_update: new Date().toLocaleDateString() },
        bcv_eur: { price: 0.00, change: 0.00, last_update: new Date().toLocaleDateString() },
        usdt: { price: 0.00, change: 0.00, last_update: new Date().toLocaleDateString() }
      });
    }, 1000);
  });
};

export const fetchHistory = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL_HISTORY);
    if (response.ok) {
      const data = await response.json();
      return data.rates || [];
    }
  } catch (e) {
    console.error("History API failed", e);
  }
  return [];
};
