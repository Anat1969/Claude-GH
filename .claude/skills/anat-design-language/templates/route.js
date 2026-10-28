import { useEffect, useState } from "react";

// ניתוב hash: הכתובת נושאת את הדף ואת החודש, כך שהעתקת קישור שומרת את המצב.
const parse = () => {
  const [path, query = ""] = window.location.hash.replace(/^#\/?/, "").split("?");
  return { page: path || "home", params: Object.fromEntries(new URLSearchParams(query)) };
};

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const go = (page, params) => {
  const q = params ? "?" + new URLSearchParams(params).toString() : "";
  window.location.hash = page === "home" ? "" : `/${page}${q}`;
};
