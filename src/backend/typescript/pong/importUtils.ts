import fg from 'fast-glob';
import { pathToFileURL } from 'url';

export async function	importGlob(glob : string)
{
	const	files = await fg(glob, {
		cwd: process.cwd(),
		absolute: true
	});

	for (const file of files)
	{
		const	path = pathToFileURL(file).href;

		await import(path);
	}
}
