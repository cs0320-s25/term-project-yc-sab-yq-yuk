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
    def parse_datetime(date_str, time_str):
        try:
            date_fmt = "%Y%m%d"
            time_fmt = "%I:%M%p"
            date_part = datetime.strptime(date_str, date_fmt).date()
            time_part = datetime.strptime(time_str.lower(), time_fmt).time()
            return datetime.combine(date_part, time_part)
        except:
            return None

    start_time = parse_datetime(date_str, start_time_raw) if start_time_raw else None
    end_time = parse_datetime(date_str, end_time_raw) if end_time_raw else None

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
