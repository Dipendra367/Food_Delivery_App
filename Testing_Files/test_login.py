from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_user_login(driver):
    driver.get("http://localhost:5000/login")
    wait = WebDriverWait(driver, 20)

    email = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//input[@type='email']"))
    )
    email.clear()
    email.send_keys("sujansubedinpnp@gmail.com")

    password = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//input[@type='password']"))
    )
    password.clear()
    password.send_keys("poupoupi")
    password.send_keys(Keys.ENTER)   # 🔥 REAL SUBMIT

    # Wait for redirect to home
    wait.until(EC.url_to_be("http://localhost:5000/"))
