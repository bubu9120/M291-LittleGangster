const toggle = document.querySelector(".toggle");
const navigation = document.querySelector(".nav-container");

toggle.addEventListener("click", () => {
  navigation.classList.toggle("nav-container--visible");
});
