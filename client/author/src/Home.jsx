import React from "react";
import { useTranslation } from "react-i18next";

function Home() {
  const { t } = useTranslation();
  return (
    <main>
      <h1>{t("Maslow Author")}</h1>
      <p>{t("This is Maslow Author, the internal-facing application.")}</p>
    </main>
  );
}

export default Home;
