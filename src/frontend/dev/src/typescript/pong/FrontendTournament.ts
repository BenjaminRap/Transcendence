export class	FrontendTournament
{
	constructor(private _participants : string[])
	{
		if (_participants.length === 0 || _participants.length % 2 !== 0)
			throw new Error(`Invalid participants count : ${_participants.length}`);
	}
}
