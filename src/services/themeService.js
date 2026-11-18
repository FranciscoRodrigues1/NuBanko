const THEME_KEY = "nubanko-theme";

export function readThemePreference() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    return savedTheme === "light" ? "light" : "dark";
  } catch (error) {
    console.error("Não foi possível carregar a preferência de tema do NuBanko.", error);
    return "dark";
  }
}

export function saveThemePreference(theme) {
  window.localStorage.setItem(THEME_KEY, theme);
}
