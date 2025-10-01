import { Terminal } from './typescript/terminal'



export function addDiv(id: string, content: string) {
	const container = document.createElement('div')
	container.innerHTML = content
	container.id = id
	document.body.appendChild(container)
	window.location.replace(`/#/${id}`)
}

export function removeDiv(id: string) {
	const container = document.getElementById(id)
	if (container) {
		document.body.removeChild(container)
	}
}

Terminal.buildTerminal()

// addDiv('profileDiv', profileDiv)
