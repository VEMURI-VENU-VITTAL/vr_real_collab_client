import { router } from "./utils/pageRouter";


window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);
