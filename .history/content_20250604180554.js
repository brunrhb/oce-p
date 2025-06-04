const content = {};

// #region PROJET1

// #region p1s1
content["p1s1-credit1"] = "2024 ©La Nature Festival Liège";
content["p1s1-credit2"] = "2024 ©La Nature Festival Liège";
content["p1s1-credit3"] = "2022 ©ESA Réunion";
content["p1s1-credit4"] = "2022 ©ESA Réunion";
content["p1s1-credit5"] = "2022 workshop @Salazie";

content["p1s1-protocole-titre"] = "Protocole :";
content["p1s1-protocole-corps"] = `
  En pleine nature, dans un jardin,<br>
  ou n’importe où avec de la nature mobile.<br>
  Face aux regardeur.euses,<br>
  établir une connexion visuelle<br>
  avec chaque personne.<br>
  Tourner le dos, s’agenouiller et crier...<br>
  Crier tout ce que je peux,<br>
  tout ce qui est coincé, tout ce qui doit sortir.<br>
  Aller à la rencontre du végétal, l’enlacer,<br>
  prendre ma place contre la sienne<br>
  et lui raconter mes mots tendres.
`;
// #endregion

// #region p1s2
content["p1s2-credit1"] = "2022 @ESA Réunion";

// #endregion

// #endregion


// #region injection
window.addEventListener("DOMContentLoaded", () => {
  Object.entries(content).forEach(([key, value]) => {
    const el = document.querySelector(`[data-content="${key}"]`);
    if (el) el.innerHTML = value;
  });
});
// #endregion
