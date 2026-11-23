export default function PiggyAvatar({ size = "header", talking = false }) {
  return (
    <span
      className={`nubi-piggy nubi-piggy-${size}${talking ? " talking" : ""}`}
      aria-hidden="true"
    >
      <span className="nubi-piggy-ear ear-left" />
      <span className="nubi-piggy-ear ear-right" />
      <span className="nubi-piggy-foot foot-left" />
      <span className="nubi-piggy-foot foot-right" />
      <span className="nubi-piggy-slot" />
      <span className="nubi-piggy-eye eye-left" />
      <span className="nubi-piggy-eye eye-right" />
      <span className="nubi-piggy-snout">
        <i />
        <i />
      </span>
      <span className="nubi-piggy-mouth" />
    </span>
  );
}
