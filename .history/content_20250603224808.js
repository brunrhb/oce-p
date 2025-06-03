const content = {
  // Crédits images
  "p1s1-credit1": "2024 ©La Nature Festival Liège",
  "p1s1-credit2": "2024 ©La Nature Festival Liège",
  "p1s1-credit3": "2022 ©ESA Réunion",
  "p1s1-credit4": "2022 ©ESA Réunion",
  "p1s1-credit5": "2022 workshop @Salazie",

  // Titre du protocole
  "p1s1-protocole-titre": "Protocole :",

  // Corps du protocole
  "p1s1-protocole-corps": `
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
  `
};


window.addEventListener("DOMContentLoaded", () => {
  Object.entries(content).forEach(([key, value]) => {
    const el = document.querySelector(`[data-content="${key}"]`);
    if (el) el.innerHTML = value;
  });
});