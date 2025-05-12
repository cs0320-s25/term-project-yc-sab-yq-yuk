import os
import json
import time
import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from crawl_event import scrape_event_detail
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("crawler.log"),
        logging.StreamHandler(),
    ],
)

def load_seen_links(filename="seen_links.json"):
    if not os.path.exists(filename) or os.path.getsize(filename) == 0:
        return set()
    with open(filename, "r") as f:
        return set(json.load(f))


def save_seen_links(seen_links, filename="seen_links.json"):
    with open(filename, "w") as f:
        json.dump(list(seen_links), f, indent=2)


def save_events(events, filename="events.json"):
    # from pprint import pprint
    # pprint(events)

    old = []
    if os.path.exists(filename) and os.path.getsize(filename) > 0:
        with open(filename, "r") as f:
            old = json.load(f)

    for event in events:
        for key in ("start_time", "end_time"):
            if isinstance(event.get(key), datetime.datetime):
                event[key] = event[key].isoformat()

    with open(filename, "w") as f:
        json.dump(old + events, f, indent=2)


from db import get_connection


def insert_event(event):
    if not event.get("start_time"):
        logging.warning(
            f"Skipping event with missing start_time (url: {event.get('url')})"
        )
        return

    conn = get_connection()
    cursor = conn.cursor()

    event_data = {
        "name": event["name"],
        "start_time": event["start_time"],
        "end_time": event["end_time"],
        "timezone": event.get("timezone"),
        "location": event.get("location"),
        "description": event.get("description"),
        "event_type": event.get("event_type"),
        "link": event.get("link") or event.get("url"),
        "latitude": event.get("latitude"),
        "longitude": event.get("longitude"),
    }

    insert_event_sql = """
    INSERT INTO events (
        name, start_time, end_time, timezone, location, description, 
        event_type, link, latitude, longitude
    ) VALUES (
        %(name)s, %(start_time)s, %(end_time)s, %(timezone)s, %(location)s, 
        %(description)s, %(event_type)s, %(link)s, %(latitude)s, %(longitude)s
    )
    """

    cursor.execute(insert_event_sql, event_data)

    # auto increment
    event_id = cursor.lastrowid

    # Insert categories
    for category in event.get("categories", []):
        cursor.execute(
            "INSERT IGNORE INTO categories (category_name) VALUES (%s)", (category,)
        )
        cursor.execute(
            "SELECT category_id FROM categories WHERE category_name = %s", (category,)
        )
        category_id = cursor.fetchone()[0]
        cursor.execute(
            "INSERT IGNORE INTO event_categories (event_id, category_id) VALUES (%s, %s)",
            (event_id, category_id),
        )

    conn.commit()
    cursor.close()
    conn.close()


def get_event_links_for_date(driver, date_str):
    url = f"https://events.brown.edu/day/date/{date_str}"
    driver.get(url)
    time.sleep(2)
    elements = driver.find_elements(By.CSS_SELECTOR, ".lw_events_title a")
    return [e.get_attribute("href") for e in elements]


def main():
    seen_links = load_seen_links()
    new_seen_links = set(seen_links)
    all_event_details = []

    options = Options()
    options.add_argument(
        "--headless"
    )  # Run the browser in headless mode (no visible window)

    driver = webdriver.Chrome(options=options)

    # for offset in range(0, 2):  # crawl next 7 days
    for offset in range(50):
        date = (datetime.date.today() + datetime.timedelta(days=offset)).strftime("%Y%m%d")
        event_links = get_event_links_for_date(driver, date)
        logging.info(f"\n📅 Date: {date} - Found {len(event_links)} event links")

        daily_success_count = 0

        for link in event_links:
        # for link in event_links[:3]:
            if link in seen_links:
                continue
            try:
                detail = scrape_event_detail(link, date)
                insert_event(detail)
                new_seen_links.add(link)
                all_event_details.append(detail)
                daily_success_count += 1
            except Exception as e:
                logging.error(f"Failed to scrape {link}: {e}")

        logging.info(f"[✓] Done crawling {date}: {daily_success_count} events inserted.")
        print(f"[✓] Done crawling {date}: {daily_success_count} events inserted.")
        save_seen_links(new_seen_links)

    driver.quit()

    # save_events(all_event_details)
    # save_seen_links(new_seen_links)

    # print(f"[✓] Collected {len(all_event_details)} new events.")


if __name__ == "__main__":
    main()
