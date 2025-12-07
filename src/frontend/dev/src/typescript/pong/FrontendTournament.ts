export type Profile = {
	name : string;
	image : string;
}

export class	FrontendTournament
{
	constructor(private _participants : Profile[])
	{
		if (_participants.length === 0 || _participants.length % 2 !== 0)
			throw new Error(`Invalid participants count : ${_participants.length}`);
	}
}
