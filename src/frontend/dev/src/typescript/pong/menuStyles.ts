import zod from "zod";

const	head = document.querySelector("head");

addImageToPreload("/scenes/assets/project/textures/arrowColorful.png");
addImageToPreload("/scenes/assets/project/textures/arrowBasic.png");
addImageToPreload("/scenes/assets/project/textures/arrowBasicHover.png");

function	addImageToPreload(imageUrl : string)
{
	if (!head)
		return ;
	head.innerHTML += `
		<link rel="prefetch" as="image" href="${imageUrl}">
	`;
}

type Theme = {
	"--font": string,
	"--text-color": string,
	"--font-weight": string,
	"--rounded": string,
	"--border-color": string,
	"--border-width": string,
	"--background-image": string,
	"--background-color": string,
	"--hover-scale": string,
	"--hover-brightness": string,
	"--hover-background-color": string,
	"--hover-text-color": string,
	"--hover-animation" : string
	"--active-scale": string,
	"--active-brightness": string,
	"--backdrop-blur": string,
	"--switch-button-image": string,
	"--switch-button-image-hover": string,
	"--title-left": string,
	"--title-color": string,
	"--title-shadow": string,
}

type Themes = {
	"colorful": Theme,
	"basic": Theme,
	"terminal" : Theme
}

const	themes : Themes = {
	"colorful": {
		"--font": "JungleAdventurer",
		"--text-color": "var(--color-white)",
		"--font-weight": "var(--font-weight-semibold)",
		"--rounded": "calc(infinity * 1px)",
		"--border-color": "var(--color-blue-300)",
		"--border-width": "0.3vw",
		"--background-image": "linear-gradient(to bottom, var(--color-cyan-500), var(--color-blue-500))",
		"--background-color": "unset",
		"--hover-scale": "115%",
		"--hover-brightness": "90%",
		"--hover-background-color": "unset",
		"--hover-text-color": "var(--color-white)",
		"--hover-animation" : "none",
		"--active-scale": "90%",
		"--active-brightness": "75%",
		"--backdrop-blur": "0",
		"--switch-button-image": "url(/scenes/assets/project/textures/arrowColorful.png)",
		"--switch-button-image-hover": "url(/scenes/assets/project/textures/arrowColorful.png)",
		"--title-left": "calc(1/3 * 100%)",
		"--title-color": "var(--color-black)",
		"--title-shadow": "8px 8px 4px rgba(75, 80, 90, 1)"
	},
	"basic": {
		"--font": "pixel",
		"--text-color": "var(--color-white)",
		"--font-weight": "var(--font-weight-bold)",
		"--rounded": "var(--radius-lg)",
		"--border-color": "var(--color-white)",
		"--border-width": "0.3vw",
		"--background-image": "unset",
		"--background-color": "transparent",
		"--hover-scale": "110%",
		"--hover-brightness": "100%",
		"--hover-background-color": "var(--color-white)",
		"--hover-text-color": "var(--color-black)",
		"--hover-animation" : "none",
		"--active-scale": "95%",
		"--active-brightness": "100%",
		"--backdrop-blur": "var(--blur-md)",
		"--switch-button-image": "url(/scenes/assets/project/textures/arrowBasic.png)",
		"--switch-button-image-hover": "url(/scenes/assets/project/textures/arrowBasicHover.png)",
		"--title-left": "calc(1/2 * 100%)",
		"--title-color": "var(--color-white)",
		"--title-shadow": "none"
	},
	"terminal": {
		"--font": "VT323",
		"--text-color": "var(--color-green-300)",
		"--font-weight": "var(--font-weight-bold)",
		"--rounded": "var(--radius-md)",
		"--border-color": "var(--text-color)",
		"--border-width": "0.2vw",
		"--background-image": "unset",
		"--background-color": "transparent",
		"--hover-scale": "101%",
		"--hover-brightness": "100%",
		"--hover-background-color": "var(--background-color)",
		"--hover-text-color": "var(--text-color)",
		"--hover-animation" : "blink 0.8s infinite",
		"--active-scale": "100%",
		"--active-brightness": "100%",
		"--backdrop-blur": "var(--blur-md)",
		"--switch-button-image": "url(/images/terminalArrow.png)",
		"--switch-button-image-hover": "url(/images/terminalArrow.png)",
		"--title-left": "calc(1/3 * 100%)",
		"--title-color": "var(--color-green-500)",
		"--title-shadow": "none"
	}
};

export const	zodThemeName = zod.literal(["basic", "colorful", "terminal"]);
export type ThemeName = zod.infer<typeof zodThemeName>

export function	applyTheme(element : HTMLElement, theme : ThemeName)
{
	Object.entries(themes[theme]).forEach(([key, value]) => {
		element.style.setProperty(key, value);
	})
}
