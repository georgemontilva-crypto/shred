import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { site } from "../data/site";

const KEY = "sm-age-ok";

function alreadyConfirmed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export default function AgeGate() {
  const [state, setState] = useState<"hidden" | "ask" | "denied">(() => (alreadyConfirmed() ? "hidden" : "ask"));
  const yes = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state === "hidden") return;
    document.body.style.overflow = "hidden";
    yes.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [state]);

  if (state === "hidden") return null;

  const confirm = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* private mode: the gate simply shows again next visit */
    }
    setState("hidden");
  };

  return (
    <div className="gate on-dark" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="gate__card">
        <Logo variant="mark" className="gate__mark" />
        {state === "ask" ? (
          <>
            <h2 id="gate-title" className="heading">
              Are you {site.minimumAge} or older?
            </h2>
            <p className="muted">This site shows products intended for adults.</p>
            <div className="gate__actions">
              <button ref={yes} className="btn btn--light" onClick={confirm}>
                Yes, I'm {site.minimumAge} or older
              </button>
              <button className="btn btn--ghost" onClick={() => setState("denied")}>
                No
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="gate-title" className="heading">
              This site is for adults only
            </h2>
            <p className="muted">You need to be {site.minimumAge} or older to view it.</p>
            <div className="gate__actions">
              <button className="btn btn--ghost" onClick={() => setState("ask")}>
                Go back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
