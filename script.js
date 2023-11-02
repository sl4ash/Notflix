import "./tmdbAPIHandler.js";
import { loadWebsite } from "./tmdbAPIHandler.js";
import { fixBullshitRatings } from "./tmdbAPIHandler.js";

let hoveredPoster;
let hoveredContextMenu;
let mouseX;
let mouseY;
let hoveringButton = false;
let lastScrollTop = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener("scroll", () => {
  const topbar = document.querySelector(".topbar");
  let currentScrollTop = window.scrollY || document.documentElement.scrollTop;
  if (currentScrollTop > lastScrollTop) {
    topbar.classList.add("topbar-down");
  } else if (currentScrollTop < lastScrollTop) {
    topbar.classList.remove("topbar-down");
  }
  lastScrollTop = currentScrollTop;
});

//CONTEXT MENU BLYAT

async function initializeContextMenuBehavior() {
  try {
    await loadWebsite();
    await fixBullshitRatings();
    const moviePosters = document.querySelectorAll(".image-wrapper");

    moviePosters.forEach((movie) => {
      const movieDivElement = movie.parentNode;
      const contextMenuElement = movieDivElement.querySelector(
        ".movie-wheel-movie-context-menu"
      );
      const buttons = contextMenuElement.querySelectorAll(".buttons div");
      buttons.forEach((button) => {
        button.addEventListener("mouseenter", () => {
          hoveringButton = true;
          hoveredContextMenu = contextMenuElement.id;
        });
        button.addEventListener("mouseleave", () => {
          hoveringButton = false;
        });
      });

      movie.addEventListener("mouseover", () => {
        hoveredPoster = movieDivElement.id;
        handleContextMenu(contextMenuElement);
      });
      movie.addEventListener("mouseleave", () => {
        hoveredPoster = "";
        handleContextMenu(contextMenuElement);
      });

      contextMenuElement.addEventListener("mouseover", (e) => {
        hoveredContextMenu = e.target.id;
        handleContextMenu(contextMenuElement);
      });
      contextMenuElement.addEventListener("mouseleave", (e) => {
        hoveredContextMenu = "";
        handleContextMenu(contextMenuElement);
      });
    });
  } catch (error) {
    console.error("Error adding event listeners:", error);
  }
}

initializeContextMenuBehavior();

function handleContextMenu(contextMenuElement) {
  if (hoveredPoster && hoveredPoster.length >= 1) {
    setTimeout(() => {
      if (hoveredPoster == contextMenuElement.id) {
        if (contextMenuElement.style.display == "flex") return;
        else displayContextMenu(contextMenuElement);
      }
    }, 500);
  } else if (hoveredPoster.length <= 1) {
    hideContextMenu(contextMenuElement);
  }
}

function displayContextMenu(contextMenuElement) {
  contextMenuElement.style.top = mouseY - 275 + "px";
  contextMenuElement.style.left = mouseX + 5 + "px";
  contextMenuElement.style.display = "flex";

  if (
    contextMenuElement.getBoundingClientRect().x +
      contextMenuElement.offsetWidth >
    document.querySelector("main").getBoundingClientRect().width
  ) {
    contextMenuElement.style.left =
      mouseX - contextMenuElement.offsetWidth + "px";
  }

  contextMenuElement.style.pointerEvents = "auto";
  setTimeout(() => {
    contextMenuElement.style.opacity = 1;
  }, 550);
}

function hideContextMenu(contextMenuElement) {
  setTimeout(() => {
    if (
      !hoveredContextMenu &&
      hoveringButton == false &&
      hoveredPoster != contextMenuElement.id
    ) {
      contextMenuElement.style.opacity = 0;
      contextMenuElement.style.pointerEvents = "none";
      setTimeout(() => {
        contextMenuElement.style.display = "none";
      }, 800);
    }
  }, 500);
}

//END OF CONTEXT MENU BLYAT

//POSTER ARROWS BLYAT

const leftArrow = document.querySelectorAll("#leftArrow");
const rightArrow = document.querySelectorAll("#rightArrow");

leftArrow.forEach((arrow) => {
  const movieWheelMin = -80;
  arrow.addEventListener("click", (e) => {
    const movieWheel =
      arrow.parentElement.parentElement.querySelector(".movie-wheel");
    const movieWheelLeft = parseInt(
      window.getComputedStyle(movieWheel).getPropertyValue("left"),
      10
    );
    if (movieWheelLeft == movieWheelMin) return;
    arrow.style.pointerEvents = "none";
    movieWheel.style.left = movieWheelLeft + 160 + "px";

    setTimeout(() => {
      arrow.style.pointerEvents = "auto";
    }, 500);
  });
});

rightArrow.forEach((arrow) => {
  arrow.addEventListener("click", (e) => {
    const movieWheel =
      arrow.parentElement.parentElement.querySelector(".movie-wheel");
    const movieWheelLeft = parseInt(
      window.getComputedStyle(movieWheel).getPropertyValue("left"),
      10
    );
    arrow.style.pointerEvents = "none";
    movieWheel.style.left = movieWheelLeft - 160 + "px";

    setTimeout(() => {
      arrow.style.pointerEvents = "auto";
    }, 600);
  });
});
