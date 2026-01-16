from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 30)

# LOGIN
driver.get("http://localhost:5173/login")

email = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@type='email']")))
email.send_keys("sujansubedinpnp@gmail.com")

password = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@type='password']")))
password.send_keys("iamadmin")
password.send_keys(Keys.ENTER)

# WAIT LOGIN SUCCESS
wait.until(EC.url_contains("5173"))

# GO TO PAGE WHERE SEARCH EXISTS
driver.get("http://localhost:5173/products")

# WAIT SEARCH INPUT
search = wait.until(
    EC.presence_of_element_located(
        (By.XPATH, "//input[contains(@placeholder,'Search')]")
    )
)

search.clear()
search.send_keys("momo")

time.sleep(3)
driver.quit()
