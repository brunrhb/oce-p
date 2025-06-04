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

content["p1s2-extrait1"] = `
  "Nos corps sont des révolutions<br>
Nos corps sont des révolutions,<br>
Ma sœur<br><br>

T’effleurer<br>
me rappelle les guerres qui nous traversent<br>
et les narrations qui nous diluent.<br>
Encore et encore, il faudra crier<br>
du silence dans lequel on voudrait nous maintenir.<br><br>

Être contre toi me rappelle que les écosystèmes<br>
ne sont pas seulement des lieux que nous habitons<br>
mais des milieux que nous abritons.<br>
Je me souviens de nos différentes alliances<br>
et je pressens celles que nous devons retisser.<br><br>

Car ce sont ces alliances<br>
qui nous ont permise de survivre,<br>
d’être là, dignes et en vie :<br>
la connaissance de notre puissance<br>
et de notre capacité à résister par<br>
les réseaux discrets mais pérennes<br>
que nous avons su fabriquer.<br><br>

Nos corps sont des révolutions<br>
Nos corps sont des révolutions,<br>
Ma sœur<br><br>

Chaque jour, les structures rigides de mon quotidien<br>
me rappellent ce système absurde dans lequel je vis.
 `;
content["p1s2-extrait2"] = `
  cccc
 `;
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
