// components/siteSettings/checkSitePayment.js
export async function checkSitePayment(siteId) {
  const query = encodeURIComponent(`*[_type == "customerWebsite" && siteId == "${siteId}"][0]{paidStatus}`);
  const url = `https://ogrckg5g.api.sanity.io/v1/data/query/production?query=${query}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
      },
    });
    const data = await res.json();
    return data.result?.paidStatus;
  } catch (err) {
    console.error('Error checking payment status:', err);
    return true; // Allow site to load if check fails
  }
}
