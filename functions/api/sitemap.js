import { onRequest as sitemapOnRequest } from "../sitemap.xml.js";

export async function onRequest(context) {
  return sitemapOnRequest(context);
}

