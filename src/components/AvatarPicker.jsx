import { useRef, useState } from "react";
import { profileAvatars } from "../services/profileService.js";
import "./AvatarPicker.css";

export default function AvatarPicker({ avatarId, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const selectedAvatar =
    profileAvatars.find((avatar) => avatar.id === avatarId) ?? profileAvatars[0];

  function closePicker() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      className="avatar-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") closePicker();
      }}
    >
      <button
        ref={triggerRef}
        className={`avatar avatar-picker-trigger avatar-tone-${selectedAvatar.color}`}
        type="button"
        aria-label={`Seu avatar atual: ${selectedAvatar.label}. Alterar avatar`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {selectedAvatar.emoji}
      </button>
      {isOpen && (
        <section
          className="avatar-picker-popover"
          role="dialog"
          aria-label="Escolha seu avatar"
        >
          <strong>Seu avatar</strong>
          <p>Escolha como você aparece por aqui.</p>
          <div className="avatar-picker-options">
            {profileAvatars.map((avatar) => (
              <button
                key={avatar.id}
                className={`avatar-choice avatar-tone-${avatar.color}`}
                type="button"
                aria-label={`Usar avatar ${avatar.label}`}
                aria-pressed={avatar.id === selectedAvatar.id}
                onClick={() => {
                  onSelect(avatar.id);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
