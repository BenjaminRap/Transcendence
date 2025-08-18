import terminalDiv from '../public/terminal.html?raw'
import gameDiv from '../public/game.html?raw'
import('./typescript/terminal.ts')

function addDiv(id: string, content: string) {
	const container = document.createElement('div')
	container.innerHTML = content
	container.id = id
	document.body.appendChild(container)
	window.location.replace(`/#/${id}`)
}

function removeDiv(id: string) {
	const container = document.getElementById(id)
	if (container) {
		document.body.removeChild(container)
	}
}

addDiv('terminalDiv', terminalDiv)
// addDiv('gameDiv', gameDiv)
