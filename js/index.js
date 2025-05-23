const toggle = document.querySelector(".toggle");
const navigation = document.querySelector(".nav-container");

toggle.addEventListener("click", () => {
  navigation.classList.toggle("nav-container--visible");
});

 src="databaseClient.js"

    const formular = document.getElementById("kontaktformular");
    const emailFeld = document.getElementById("email");
    const nameFeld = document.getElementById("name");
    const plzFeld = document.getElementById("postleitzahl");
    const spinner = document.getElementById("spinner");

    const fehlerEmail = document.getElementById("fehler-email");
    const fehlerName = document.getElementById("fehler-name");
    const fehlerPLZ = document.getElementById("fehler-plz");

    function zeigeFehler(feld, fehlerText, bedingung) {
      if (bedingung) {
        fehlerText.style.display = "block";
        feld.classList.add("fehlerhaft");
        return true;
      } else {
        fehlerText.style.display = "none";
        feld.classList.remove("fehlerhaft");
        return false;
      }
    }

    formular.addEventListener("submit", async (event) => {
      event.preventDefault();

      let fehler = false;

      fehler |= zeigeFehler(emailFeld, fehlerEmail, !emailFeld.value.includes("@"));
      fehler |= zeigeFehler(nameFeld, fehlerName, nameFeld.value.trim() === "");
      fehler |= zeigeFehler(plzFeld, fehlerPLZ, !/^[0-9]{4,5}$/.test(plzFeld.value));

      if (fehler) return;

      spinner.style.display = "block";

      const daten = {
        email: emailFeld.value,
        name: nameFeld.value,
        postleitzahl: plzFeld.value,
        kategorie: document.getElementById("kategorie").value,
        nachricht: document.getElementById("nachricht").value
      };

      const bereitsVorhanden = await checkEmailExists(daten.email);
      if (bereitsVorhanden) {
        fehlerEmail.textContent = "Diese Email wird schon verwendet.";
        fehlerEmail.style.display = "block";
        spinner.style.display = "none";
        return;
      }

      await insertInto("little_gangster_user", daten);

      formular.reset();
      alert("Daten erfolgreich gesendet!");
      spinner.style.display = "none";
    });

    async function checkEmailExists(email) {
      const daten = await selectWhere("little_gangster_user", { email });
      return daten.length > 0;
    }
