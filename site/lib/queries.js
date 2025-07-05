export const navbarQuery = `*[_type == "navbar"][0]{
  siteTitle,
  navLinks[]{label, href}
}`;

