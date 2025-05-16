from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from crawl_event import scrape_event_detail

driver = webdriver.Chrome()
url = "https://events.brown.edu/day/date/20250510"
driver.get(url)

time.sleep(2)

elements = driver.find_elements(By.CSS_SELECTOR, ".lw_events_title a")
event_links = [e.get_attribute("href") for e in elements]

all_event_details = []
for link in event_links[:2]:
    # print(link)
    event_detail = scrape_event_detail(link)
    all_event_details.append(event_detail)

from pprint import pprint

pprint(all_event_details)

driver.quit()


# for offset in range(0, 7):
#     date = (datetime.date.today() + datetime.timedelta(days=offset)).strftime("%Y%m%d")
#     url = f"https://events.brown.edu/day/date/{date}"
