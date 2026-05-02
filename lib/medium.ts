export interface MediumArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  tags: string[];
  readTime?: number;
}

export interface MediumProfile {
  username: string;
  name: string;
  articles: MediumArticle[];
}

const MEDIUM_TIMEOUT_MS = 30_000;

/**
 * Fetch Medium articles via RSS feed (Medium provides this publicly)
 * Format: https://medium.com/feed/@username
 */
export async function fetchMediumArticles(
  username: string
): Promise<MediumProfile> {
  const cleanUsername = username.trim().replace(/^@/, "");
  
  // Medium RSS feed URL
  const feedUrl = `https://medium.com/feed/@${encodeURIComponent(cleanUsername)}`;
  
  try {
    const res = await fetch(feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(MEDIUM_TIMEOUT_MS),
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Medium user "@${cleanUsername}" not found`);
      }
      throw new Error(`Medium RSS feed error: ${res.status}`);
    }

    const xmlText = await res.text();
    
    // Parse RSS XML
    const articles = parseRSSFeed(xmlText);
    
    // Extract name from feed if available
    const nameMatch = xmlText.match(/<title>(.*?)<\/title>/);
    const feedTitle = nameMatch ? nameMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : cleanUsername;
    const name = feedTitle.replace(/^Stories by /, "").replace(/ on Medium$/, "");

    return {
      username: cleanUsername,
      name,
      articles,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch Medium articles");
  }
}

function parseRSSFeed(xml: string): MediumArticle[] {
  const articles: MediumArticle[] = [];
  
  // Match all <item> blocks in RSS
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const title = extractCDATA(itemXml, "title") || "Untitled";
    const link = extractTag(itemXml, "link") || extractTag(itemXml, "guid") || "";
    const description = extractCDATA(itemXml, "description") || "";
    const pubDate = extractTag(itemXml, "pubDate") || "";
    
    // Extract categories/tags
    const categoryRegex = /<category>(.*?)<\/category>/g;
    const tags: string[] = [];
    let categoryMatch;
    while ((categoryMatch = categoryRegex.exec(itemXml)) !== null) {
      const tag = categoryMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      if (tag) tags.push(tag);
    }
    
    // Clean up description (remove HTML tags for preview)
    const cleanDescription = description
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim()
      .slice(0, 200);
    
    // Estimate read time from content length (rough estimate: 200 words per minute)
    const wordCount = description.split(/\s+/).length;
    const readTime = Math.max(1, Math.round(wordCount / 200));
    
    if (title && link) {
      articles.push({
        title,
        description: cleanDescription,
        url: link,
        publishedAt: pubDate,
        tags,
        readTime,
      });
    }
  }
  
  return articles;
}

function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}>([^<]*)<\/${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractCDATA(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";
  
  const content = match[1];
  const cdataMatch = content.match(/!\[CDATA\[([\s\S]*?)\]\]/);
  return cdataMatch ? cdataMatch[1].trim() : content.trim();
}
