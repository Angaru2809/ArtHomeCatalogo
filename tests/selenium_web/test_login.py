import os

from selenium import webdriver
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys


BASE_URL = os.environ.get("EXPO_WEB_URL", "http://localhost:8081")
LOGIN_URL = f"{BASE_URL}/login"
SELENIUM_EMAIL = os.environ.get("SELENIUM_EMAIL")
SELENIUM_PASSWORD = os.environ.get("SELENIUM_PASSWORD")


def _wait_for_clickable(wait: WebDriverWait, xpath: str):
    return wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))

def _click_by_xpath(driver: webdriver.Chrome, wait: WebDriverWait, xpath: str) -> None:
    """
    En React Native Web, el 'button' puede no estar en estado clickable
    aunque exista en el DOM. Hacemos click por JS.
    """
    el = wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
    driver.execute_script("arguments[0].click();", el)


def _click_by_css(driver: webdriver.Chrome, wait: WebDriverWait, css_selector: str) -> None:
    root = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, css_selector)))
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", root)

    # En RN Web a veces el 'clickable' real está en un hijo dentro del contenedor.
    driver.execute_script(
        """
        const root = document.querySelector(arguments[0]);
        if (!root) return false;

        const all = root.querySelectorAll('button, [role="button"], [aria-label], div, span, a');
        let target = null;
        for (const el of all) {
          const t = (el.textContent || '').trim();
          if (t.includes('Explorar')) {
            target = el;
            break;
          }
        }

        (target || root).click();
        return true;
        """,
        css_selector,
    )

def _set_input_text(wait: WebDriverWait, xpath: str, text: str) -> None:
    """
    React Native Web puede re-renderizar inputs y dejar referencias viejas.
    Reintentamos y limpiamos con Ctrl+A + Backspace en vez de clear().
    """
    last_exc: Exception | None = None
    for _ in range(3):
        try:
            el = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
            el.click()
            el.send_keys(Keys.CONTROL, 'a')
            el.send_keys(Keys.BACKSPACE)
            el.send_keys(text)
            return
        except StaleElementReferenceException as e:
            last_exc = e
            continue
    if last_exc:
        raise last_exc


def test_login_navigates_to_donate():
    # Nota: Selenium/ChromeDriver deben estar instalados en tu máquina.
    driver = webdriver.Chrome()
    driver.set_window_size(1280, 800)

    wait = WebDriverWait(driver, 25)

    driver.get(LOGIN_URL)

    if not SELENIUM_EMAIL or not SELENIUM_PASSWORD:
        raise ValueError(
            "Faltan variables de entorno. Define:\n"
            "  SELENIUM_EMAIL\n"
            "  SELENIUM_PASSWORD\n"
            "para que el test use un usuario existente."
        )

    email = SELENIUM_EMAIL
    password = SELENIUM_PASSWORD

    _set_input_text(
        wait,
        "//input[contains(@placeholder,'Correo electrónico')]",
        email,
    )
    _set_input_text(
        wait,
        "//input[contains(@placeholder,'Contraseña')]",
        password,
    )

    # Botón "Explorar🌿" en React Native Web.
    # Usamos SIEMPRE el selector CSS porque el XPath/texto suele no coincidir
    # por el re-render del layout.
    default_explore_css = (
        "#root > div > div > div.css-view-g5y9jx.r-flex-13awgt0.r-bottom-1p0dtai.r-left-1d2f490.r-position-u8s1d"
        ".r-right-zchlnj.r-top-ipm5af > div.css-view-g5y9jx.r-flex-13awgt0 > div > div > "
        "div.css-view-g5y9jx.r-WebkitOverflowScrolling-150rngu.r-flexDirection-eqz5dr.r-flexGrow-16y2uox"
        ".r-flexShrink-1wbh5a2.r-overflowX-11yh6sk.r-overflowY-1rnoaur.r-transform-agouwx.r-flex-13awgt0"
        ".r-scrollbarWidth-2eszeu > div > div > div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-14lw9ot"
        ".r-borderRadius-y47klf.r-boxShadow-14zzrt3.r-maxWidth-hvns9x.r-padding-1lpndhm.r-width-13qz1uu"
        " > div.css-view-g5y9jx.r-transitionProperty-1i6wzkk.r-userSelect-lrvibr.r-cursor-1loqt21"
        ".r-touchAction-1otgn73.r-backgroundColor-5hecs3.r-borderRadius-1867qdf.r-borderWidth-1yadl64"
        ".r-boxShadow-1bk8zzh.r-marginBottom-15d164r.r-marginTop-19h5ruw.r-paddingBlock-1ml3abn"
        ".r-paddingInline-1u1knh"
    )

    explore_css = os.environ.get("SELENIUM_EXPLORE_CSS", default_explore_css)

    # Reintento por re-render entre el tipeo y el click.
    last_exc: Exception | None = None
    for _ in range(3):
        try:
            _click_by_css(driver, wait, explore_css)
            last_exc = None
            break
        except Exception as e:
            last_exc = e
            continue
    if last_exc:
        raise last_exc

    # A veces aparece un modal de Alert con botón "Continuar".
    try:
        continuar_btn = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.XPATH, "//*[contains(text(),'Continuar')]"))
        )
        continuar_btn.click()
    except TimeoutException:
        pass

    try:
        # Validación: en donate aparece el botón/texto "Enviar Donación"
        donate_cta = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Enviar Donación')]"))
        )
        assert donate_cta.is_displayed()
    except TimeoutException as e:
        # Si no llegamos a donate, intenta capturar un mensaje de error de login para diagnosticar.
        error_candidates = driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'Error en el Login') or contains(text(),'Credenciales') or contains(text(),'Entendido')]",
        )
        details = error_candidates[0].text.strip() if error_candidates else "No se encontró mensaje de error visible"
        raise AssertionError(f"No se navegó a Donate. Posible fallo de login. Detalle: {details}") from e
    finally:
        driver.quit()


if __name__ == "__main__":
    test_login_navigates_to_donate()

