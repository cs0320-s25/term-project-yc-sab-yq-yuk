from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import re
from selenium.webdriver.chrome.options import Options

def scrape_event_detail(url, date_str):
    from datetime import datetime

    options = Options()
    options.add_argument(
        "--headless"
    )  # Run the browser in headless mode (no visible window)

    driver = webdriver.Chrome(options=options)

    driver.get(url)
    time.sleep(2)

    # id for the event
    match = re.search(r"/event/(\d+)", url)
    event_id = match.group(1) if match else url # fallback to url if not match

    # title
    try:
        title = driver.find_element(
            By.CSS_SELECTOR, "#lw_cal_event_detail_cols_right > h1"
        ).text.strip()
    except:
        title = None

    # raw time strings
    try:
        start_time_raw = driver.find_element(
            By.CLASS_NAME, "lw_start_time"
        ).text.strip()
    except:
        start_time_raw = None
    try:
        end_time_raw = driver.find_element(By.CLASS_NAME, "lw_end_time").text.strip()
    except:
        end_time_raw = None
    try:
        timezone = driver.find_element(By.CLASS_NAME, "lw_cal_tz_abbrv").text.strip()
    except:
        timezone = None

    # Parse time strings into datetime objects using the passed-in date
    def parse_datetime(date_str, time_str, is_end=False):
        """Parse a time string into a datetime.
        Tries multiple formats in order:
          1. 'All Day' / None → midnight or 23:59
          2. '9:00AM'          → time only, use crawl date
          3. 'April 23, 9:00am' → date embedded in time string (multi-day events)
          4. 'April 23, 2026, 9:00am' → full date with year
        If the time string contains its own date, that overrides the crawl date.
        """
        date_fmt = "%Y%m%d"
        date_part = datetime.strptime(date_str, date_fmt).date()

        # Handle All Day / missing time
        if time_str is None or time_str.lower().strip() in ("all day", ""):
            if is_end:
                return datetime.combine(date_part, datetime.strptime("11:59PM", "%I:%M%p").time())
            else:
                return datetime.combine(date_part, datetime.min.time())

        cleaned = time_str.strip()

        # Normalize AM/PM to uppercase (strptime %p requires "AM"/"PM" on some systems)
        # and title-case for month names (strptime %B requires "April" not "april")
        import re
        normalized = re.sub(r'(?i)(am|pm)', lambda m: m.group().upper(), cleaned)

        # Try formats in order: most specific first
        # IMPORTANT: never lowercase format strings — %I and %M are case-sensitive
        formats = [
            # "April 23, 2026, 9:00AM" — full date with year
            ("%B %d, %Y, %I:%M%p", True),
            # "April 23, 9:00AM" — date without year (multi-day events)
            ("%B %d, %I:%M%p", True),
            # "Apr 23, 9:00AM" — abbreviated month
            ("%b %d, %I:%M%p", True),
            # "9:00AM" — time only (most common)
            ("%I:%M%p", False),
        ]

        # Try each format with two input variants: as-is and title-cased
        for fmt, has_date in formats:
            for variant in [normalized, normalized.title()]:
                try:
                    parsed = datetime.strptime(variant, fmt)
                    if has_date:
                        # The time string contained its own date — use it
                        if parsed.year == 1900:
                            parsed = parsed.replace(year=date_part.year)
                        return parsed
                    else:
                        return datetime.combine(date_part, parsed.time())
                except ValueError:
                    continue

        # Nothing matched — log and return None
        import logging
        logging.warning(f"Could not parse time string: '{time_str}' — needs LLM parsing")
        return None

    start_time = parse_datetime(date_str, start_time_raw, is_end=False)
    end_time = parse_datetime(date_str, end_time_raw, is_end=True)


    # description
    try:
        description = driver.find_element(
            By.CLASS_NAME, "lw_calendar_event_description"
        ).text.strip()
    except:
        description = None

    # location
    try:
        location = (
            driver.find_element(By.XPATH, "//section[h5[text()='Location:']]")
            .text.replace("Location:", "")
            .strip()
        )
    except:
        location = None

    # event_type
    try:
        event_type = (
            driver.find_element(By.XPATH, "//section[h5[text()='Event Type:']]")
            .text.replace("Event Type:", "")
            .strip()
        )
    except:
        event_type = None

    # map link
    latitude = longitude = map_url = None
    try:
        map_url = driver.find_element(
            By.CSS_SELECTOR, "span.icon.i-google-map a"
        ).get_attribute("href")
        if "maps?q=" in map_url:
            coords = map_url.split("maps?q=")[1]
            lat_str, lon_str = coords.split(",")
            latitude = float(lat_str)
            longitude = float(lon_str)
    except:
        pass

    # group
    group = None
    try:
        group = driver.find_element(
            By.CSS_SELECTOR, "div.lw_cal_event_group a"
        ).text.strip()
    except:
        pass

    tags = []
    try:
        tag_elements = driver.find_elements(By.CSS_SELECTOR, "div.lw_cal_event_tags a")
        tags = [tag.text.strip() for tag in tag_elements]
    except:
        pass

    driver.quit()

    return {
        # "event_id": event_id,
        "name": title,
        "start_time": start_time,
        "end_time": end_time,
        "timezone": timezone,
        "description": description,
        "location": location,
        "event_type": event_type,
        "latitude": latitude,
        "longitude": longitude,
        "group": group,
        "categories": tags,
        "url": url,
    }


if __name__ == "__main__":
    url = "https://events.brown.edu/event/309945-day-on-college-hill"
    detail = scrape_event_detail(url)
    from pprint import pprint

    pprint(detail)
