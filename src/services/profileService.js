export const profileAvatars = [
  { id: "spark", emoji: "✨", label: "Estrela", color: "violet" },
  { id: "rocket", emoji: "🚀", label: "Foguete", color: "blue" },
  { id: "fox", emoji: "🦊", label: "Raposa", color: "orange" },
  { id: "cat", emoji: "🐱", label: "Gato", color: "pink" },
  { id: "headphones", emoji: "🎧", label: "Fone", color: "lime" },
  { id: "alien", emoji: "👾", label: "Alien", color: "cyan" },
  { id: "lightning", emoji: "⚡", label: "Raio", color: "yellow" },
  { id: "game", emoji: "🎮", label: "Controle", color: "green" },
];

const DEFAULT_AVATAR = profileAvatars[0].id;

function getStorageKey(email) {
  return `nubanko-profile-avatar:${email || "demo"}`;
}

export function readProfilePreference(email) {
  try {
    const savedId = window.localStorage.getItem(getStorageKey(email));
    const avatarId = profileAvatars.some((avatar) => avatar.id === savedId)
      ? savedId
      : DEFAULT_AVATAR;
    return { avatarId, error: "" };
  } catch (error) {
    console.error("Não foi possível carregar o avatar do perfil.", error);
    return {
      avatarId: DEFAULT_AVATAR,
      error: "Não foi possível carregar o avatar salvo neste navegador.",
    };
  }
}

export function saveProfilePreference(avatarId, email) {
  if (!profileAvatars.some((avatar) => avatar.id === avatarId)) {
    throw new Error("O avatar selecionado não é válido.");
  }
  window.localStorage.setItem(getStorageKey(email), avatarId);
}
