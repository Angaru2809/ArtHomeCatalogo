import os
import urllib.request
from urllib.error import URLError, HTTPError

from selenium import webdriver
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys


def _resolve_base_url() -> str:
    env_url = os.environ.get("EXPO_WEB_URL")
    if env_url:
        return env_url.rstrip("/")

    candidates = [
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8080",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
        "http://localhost:19006",
    ]
    for base in candidates:
        try:
            with urllib.request.urlopen(f"{base}/login", timeout=1.5):
                return base
        except HTTPError:
            return base
        except URLError:
            continue
        except Exception:
            continue
    return candidates[0]


def _load_selenium_env_file() -> None:
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    env_file = os.path.join(repo_root, "tests", "selenium_web", ".env.selenium")
    if not os.path.exists(env_file):
        return
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                key = k.strip()
                val = v.strip().strip('"').strip("'")
                if key and val and key not in os.environ:
                    os.environ[key] = val
    except Exception:
        pass


_load_selenium_env_file()


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


def test_login_navigates_to_catalogo():
    base_url = _resolve_base_url()
    login_url = f"{base_url}/login"
    selenium_email = os.environ.get("SELENIUM_EMAIL")
    selenium_password = os.environ.get("SELENIUM_PASSWORD")

    # Nota: Selenium/ChromeDriver deben estar instalados en tu máquina.
    driver = webdriver.Chrome()
    driver.set_window_size(1280, 800)

    wait = WebDriverWait(driver, 25)

    try:
        driver.get(login_url)
    except Exception as e:
        raise RuntimeError(
            f"No pude abrir {login_url}. "
            "Verifica que `npm run web` siga corriendo y que el puerto sea correcto."
        ) from e

    if not selenium_email or not selenium_password:
        raise ValueError(
            "Faltan credenciales. Define SELENIUM_EMAIL/SELENIUM_PASSWORD "
            "o agrégalas en tests/selenium_web/.env.selenium."
        )

    email = selenium_email
    password = selenium_password

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
        # Validación: tras login se muestra catálogo (input Buscar)
        catalogo_search = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder,'Buscar')]"))
        )
        assert catalogo_search.is_displayed()
    except TimeoutException as e:
        # Si no llegamos al catálogo, intenta capturar un mensaje de error de login para diagnosticar.
        error_candidates = driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'Error en el Login') or contains(text(),'Credenciales') or contains(text(),'Entendido')]",
        )
        details = error_candidates[0].text.strip() if error_candidates else "No se encontró mensaje de error visible"
        raise AssertionError(f"No se navegó al catálogo. Posible fallo de login. Detalle: {details}") from e
    finally:
        driver.quit()


if __name__ == "__main__":
    test_login_navigates_to_catalogo()