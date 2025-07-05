// lib/checkSiteDisabled.js
export async function checkSiteDisabled() {
  const query = encodeURIComponent(`*[_type == "siteDisabledSettings"][0]{
    title,
    message,
    contactEmail,
    contactPhone,
    logo { asset->{url} },
    supportLinks[]
  }`);
  const url = `https://ogrckg5g.api.sanity.io/v1/data/query/production?query=${query}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return data.result || null;
  } catch (err) {
    console.error('Error fetching site disabled data:', err);
    return null;
  }
}
