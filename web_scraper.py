import trafilatura
import sys
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('web_scraper')

def get_website_text_content(url: str) -> str:
    """
    This function takes a url and returns the main text content of the website.
    The text content is extracted using trafilatura and easier to understand.
    The results is not directly readable, better to be summarized by LLM before consume
    by the user.

    Some common website to crawl information from:
    JKT48 website: https://jkt48.com/news/list?lang=id
    Theater schedules: https://jkt48.com/theater/schedule?lang=id
    Twitter/X: https://twitter.com/officialJKT48 or https://x.com/officialJKT48
    Instagram: https://www.instagram.com/jkt48official/
    TikTok: https://www.tiktok.com/@jkt48.official
    YouTube: https://youtube.com/@jkt48official
    IDN App: https://www.idn.app/jkt48official
    Showroom: https://www.showroom-live.com/JKT48_Official
    """
    try:
        # Send a request to the website
        downloaded = trafilatura.fetch_url(url)
        
        if downloaded is None:
            logger.error(f"Failed to download content from {url}")
            return ""
            
        # Extract the main text content
        text = trafilatura.extract(downloaded)
        
        if text is None:
            logger.error(f"Failed to extract content from {url}")
            return ""
            
        return text
    except Exception as e:
        logger.error(f"Error extracting content from {url}: {str(e)}")
        return ""


if __name__ == "__main__":
    # Check if URL is provided as command line argument
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(get_website_text_content(url))
    else:
        print("Usage: python web_scraper.py <url>")